import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

async function requireAdmin(req: Request | NextRequest) {
  const adminClient = getSupabaseAdmin();
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '') ?? null;
  
  if (!token) {
    return null;
  }

  const { data, error } = await adminClient.auth.getUser(token);
  if (error || !data?.user) {
    return null;
  }
  
  const email = data.user.email;
  
  const { data: rows, error: roleError } = await adminClient
    .from('employees')
    .select('role')
    .eq('email', email)
    .single();
  
  if (roleError || !rows || rows.role !== 'Admin') {
    return null;
  }
  
  return { user: data.user, email, userId: data.user.id };
}

// GET - Fetch a single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = getSupabaseAdmin();
    const id = params.id;

    const { data, error } = await admin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PATCH - Update a product
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const identity = await requireAdmin(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;
    const body = await request.json();
    const admin = getSupabaseAdmin();

    // Whitelist fields that can be updated
    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.sku !== undefined) updates.sku = body.sku;
    if (body.category !== undefined) updates.category = body.category;
    if (body.msrp_value !== undefined) updates.msrp_value = body.msrp_value;
    if (body.msrp_currency !== undefined) updates.msrp_currency = body.msrp_currency;
    if (body.active !== undefined) updates.active = body.active;
    if (body.featured !== undefined) updates.featured = body.featured;
    if (body.images !== undefined) updates.images = body.images;
    if (body.options !== undefined) updates.options = body.options;
    if (body.variants !== undefined) updates.variants = body.variants;
    
    updates.updated_at = new Date().toISOString();

    const { data, error } = await admin
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}
