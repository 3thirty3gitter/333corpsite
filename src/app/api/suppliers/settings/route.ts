import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

async function requireAdmin(req: Request | NextRequest) {
  const admin = getSupabaseAdmin();
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '') ?? null;
  if (!token) return null;

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return null;
  
  const email = data.user.email;
  const { data: rows } = await admin.from('employees').select('role').eq('email', email).single();
  if (!rows || rows.role !== 'Admin') return null;
  
  return { user: data.user, email };
}

// GET - Fetch supplier settings
export async function GET(request: NextRequest) {
  try {
    const identity = await requireAdmin(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('supplier_settings')
      .select('*')
      .order('id');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mask passwords in response
    const safeData = data?.map(supplier => ({
      ...supplier,
      credentials: supplier.credentials ? {
        ...supplier.credentials as object,
        password: supplier.credentials && (supplier.credentials as any).password ? '••••••••' : undefined,
      } : {},
    }));

    return NextResponse.json({ success: true, suppliers: safeData });
  } catch (error) {
    console.error('Error fetching supplier settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplier settings' },
      { status: 500 }
    );
  }
}

// POST - Update supplier settings
export async function POST(request: NextRequest) {
  try {
    const identity = await requireAdmin(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { supplierId, enabled, credentials, settings } = body;

    if (!supplierId) {
      return NextResponse.json({ error: 'supplierId is required' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // Get existing settings to preserve password if not changed
    const { data: existing } = await admin
      .from('supplier_settings')
      .select('credentials')
      .eq('id', supplierId)
      .single();

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (enabled !== undefined) {
      updateData.enabled = enabled;
    }

    if (credentials) {
      // If password is masked, keep existing password
      const newCredentials = { ...credentials };
      if (newCredentials.password === '••••••••' && existing?.credentials) {
        newCredentials.password = (existing.credentials as any).password;
      }
      updateData.credentials = newCredentials;
    }

    if (settings) {
      updateData.settings = settings;
    }

    // Upsert settings
    const { data, error } = await admin
      .from('supplier_settings')
      .upsert({ id: supplierId, ...updateData })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      supplier: {
        ...data,
        credentials: data.credentials ? {
          ...data.credentials as object,
          password: (data.credentials as any).password ? '••••••••' : undefined,
        } : {},
      }
    });
  } catch (error) {
    console.error('Error updating supplier settings:', error);
    return NextResponse.json(
      { error: 'Failed to update supplier settings' },
      { status: 500 }
    );
  }
}
