import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const table = url.searchParams.get('table');
  try {
    const admin = getSupabaseAdmin();
    if (!admin) return NextResponse.json({ connected: false, message: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 400 });

    if (!table) {
      // just a connection health check
      return NextResponse.json({ connected: true, message: 'Supabase admin client initialized' });
    }

    // simple test of the table if provided
    const { data, error } = await admin.from(table).select('*').limit(1);
    if (error) return NextResponse.json({ connected: false, message: error.message }, { status: 500 });
    return NextResponse.json({ connected: true, rows: Array.isArray(data) ? data.length : 0 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ connected: false, message: String(err?.message || err) }, { status: 500 });
  }
}
