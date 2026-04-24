
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const admin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const { data: progress, error } = await admin
      .from('user_training_progress')
      .select('module_id, status, completed_at')
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true, data: progress });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = getSupabaseAdmin();
    const body = await request.json();
    const { user_id, module_id, status } = body;

    const { data, error } = await admin
      .from('user_training_progress')
      .upsert({
        user_id,
        module_id,
        status,
        completed_at: status === 'Completed' ? new Date().toISOString() : null
      }, { onConflict: 'user_id,module_id' })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
