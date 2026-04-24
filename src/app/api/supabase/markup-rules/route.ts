import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const admin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    
    let query = admin.from('markup_rules').select('*');
    
    if (profileId) {
      query = query.eq('profile_id', profileId);
    } else {
      // Default to active profile
      const { data: activeProfile } = await admin
        .from('markup_profiles')
        .select('id')
        .eq('is_active', true)
        .single();
      
      if (activeProfile) {
        query = query.eq('profile_id', activeProfile.id);
      }
    }

    const { data: rules, error } = await query.order('priority', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json({ success: true, rules });
  } catch (error) {
    console.error('Markup rules fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch markup rules' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { supplier, category, markup_percent, markup_flat, priority, profile_id } = body;
    const admin = getSupabaseAdmin();

    const { data, error } = await admin
      .from('markup_rules')
      .insert([{
        supplier,
        category,
        markup_percent,
        markup_flat,
        priority,
        profile_id
      }])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Markup rules POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const admin = getSupabaseAdmin();

    if (!id) throw new Error('ID required');

    const { error } = await admin
      .from('markup_rules')
      .delete()
      .match({ id });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Markup rules DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
