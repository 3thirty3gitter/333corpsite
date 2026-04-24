import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Create the master admin account with a server-side secret.
export async function POST(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    if (!admin) return NextResponse.json({ success: false, message: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 400 });

    const { email, name, secret } = await req.json().catch(() => ({}));
    const expected = process.env.MASTER_ADMIN_SECRET;
    if (!expected) return NextResponse.json({ success: false, message: 'MASTER_ADMIN_SECRET not set' }, { status: 500 });
    if (secret !== expected) return NextResponse.json({ success: false, message: 'invalid secret' }, { status: 401 });
    if (!email) return NextResponse.json({ success: false, message: 'email required' }, { status: 400 });

    // Upsert into employees table
    const { data, error } = await admin.from('employees').upsert({ email, name: name ?? null, role: 'Admin' }).select();
    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    return NextResponse.json({ success: true, rows: data });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, message: String(err?.message || err) }, { status: 500 });
  }
}
