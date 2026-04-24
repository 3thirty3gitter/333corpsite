import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    if (!admin) return NextResponse.json({ success: false, message: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 400 });

    const { data, error } = await admin
      .from('pilot_test')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, rows: data });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, message: String(err?.message || err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    if (!admin) return NextResponse.json({ success: false, message: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 400 });

    // Delete all rows from pilot_test; filter to ensure deletion is applied
    const { data, error } = await admin
      .from('pilot_test')
      .delete()
      .neq('id', '');

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, rows: data });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, message: String(err?.message || err) }, { status: 500 });
  }
}
