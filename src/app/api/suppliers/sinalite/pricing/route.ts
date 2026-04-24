import { NextRequest, NextResponse } from 'next/server';
import { getSinaLiteConfig } from '../auth';
import { getSupabaseAdmin } from '@/lib/supabase';

interface PriceRequest {
  productId: number;
  productOptions: number[];
}

async function requireAdmin(req: Request | NextRequest) {
  const adminClient = getSupabaseAdmin();
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '') ?? null;
  if (!token) return null;
  const { data, error } = await adminClient.auth.getUser(token);
  if (error || !data?.user) return null;
  const email = data.user.email;
  const { data: rows, error: roleError } = await adminClient.from('employees').select('role').eq('email', email).single();
  if (roleError || !rows || rows.role !== 'Admin') return null;
  return { user: data.user, email, userId: data.user.id };
}

export async function POST(request: NextRequest) {
  try {
    const identity = await requireAdmin(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: PriceRequest = await request.json();
    const { productId, productOptions } = body;
    
    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      );
    }
    
    if (!productOptions || !Array.isArray(productOptions)) {
      return NextResponse.json(
        { error: 'productOptions array is required' },
        { status: 400 }
      );
    }
    
    const { baseUrl, token, storeCode } = await getSinaLiteConfig();
    
    // Request pricing from SinaLite
    const response = await fetch(`${baseUrl}/price/${productId}/${storeCode}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        productOptions: productOptions,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('SinaLite pricing error:', errorText);
      return NextResponse.json(
        { error: 'Failed to get pricing from SinaLite' },
        { status: response.status }
      );
    }
    
    const pricing = await response.json();
    
    return NextResponse.json({
      productId,
      storeCode,
      pricing,
    });
    
  } catch (error) {
    console.error('SinaLite pricing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to calculate pricing' },
      { status: 500 }
    );
  }
}
