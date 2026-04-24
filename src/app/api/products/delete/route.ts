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

// DELETE /api/products - Delete one or more products
export async function DELETE(request: NextRequest) {
  try {
    const identity = await requireAdmin(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Missing product IDs' },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    const { error: deleteError, count } = await admin
      .from('products')
      .delete()
      .in('id', ids);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete products', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedCount: count || ids.length,
    });
  } catch (error) {
    console.error('Delete products error:', error);
    return NextResponse.json(
      { error: 'Failed to delete products' },
      { status: 500 }
    );
  }
}
