import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    if (!admin) return NextResponse.json({ success: false, message: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 400 });

    const { name } = await req.json().catch(() => ({ name: 'test' }));

    const { data, error } = await admin.from('pilot_test').insert({ name }).select();
    if (error) {
      if (error.message?.includes('does not exist') || error.details?.includes('table') ) {
        return NextResponse.json({ success: false, message: 'pilot_test table not present. Run migrations.' }, { status: 400 });
      }
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, rows: data });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, message: err?.message || String(err) }, { status: 500 });
  }
}
