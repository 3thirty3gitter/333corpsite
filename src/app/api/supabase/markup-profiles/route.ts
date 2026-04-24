
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const admin = getSupabaseAdmin();
    
    // Fetch all profiles
    const { data: profiles, error } = await admin
      .from('markup_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json({ success: true, profiles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, description, is_active } = body;
    const admin = getSupabaseAdmin();

    if (id) {
       // UPDATE
       const { data, error } = await admin
        .from('markup_profiles')
        .update({ name, description, is_active })
        .eq('id', id)
        .select();

       if (error) throw error;

       // If this profile is now active, deactivate all others
       if (is_active) {
         await admin
           .from('markup_profiles')
           .update({ is_active: false })
           .neq('id', id);
       }

       return NextResponse.json({ success: true, data });
    } else {
       // CREATE
       const { data, error } = await admin
        .from('markup_profiles')
        .insert([{ name, description, is_active: is_active || false }])
        .select();

       if (error) throw error;
       return NextResponse.json({ success: true, data });
    }
  } catch (error: any) {
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
      .from('markup_profiles')
      .delete()
      .match({ id });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
