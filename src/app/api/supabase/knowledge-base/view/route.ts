
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const admin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    // Increment view_count using RPC or manual update
    // Note: Suapbase doesn't have a built-in increment without RPC, so we'll fetch and update
    // or use a raw SQL approach if RPC isn't defined.
    
    const { data: article, error: fetchError } = await admin
      .from('knowledge_base_articles')
      .select('view_count')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { error: updateError } = await admin
      .from('knowledge_base_articles')
      .update({ view_count: (article.view_count || 0) + 1 })
      .eq('id', id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
