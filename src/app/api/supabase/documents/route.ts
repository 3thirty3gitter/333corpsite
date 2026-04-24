
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const admin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    console.log('Fetching documents for category:', category);
    
    let query = admin.from('documents').select('*');
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: documents, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase error fetching documents:', error);
      throw error;
    }

    // If a document ID is provided, also fetch its versions
    const documentId = searchParams.get('documentId');
    if (documentId) {
      const { data: versions, error: vError } = await admin
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false });
      
      if (!vError) {
        return NextResponse.json({ success: true, document: documents.find(d => d.id === documentId), versions });
      }
    }
    
    console.log(`Successfully fetched ${documents?.length || 0} documents`);
    return NextResponse.json({ success: true, documents });
  } catch (error: any) {
    console.error('Error in GET /api/supabase/documents:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    const body = await req.json();
    const { id, title, description, category, file_url, file_type, file_size, is_important, changes_summary } = body;

    if (id) {
      // Create a NEW VERSION for an existing document
      // 1. Get current versions to determine next number
      const { data: versions, error: vError } = await admin
        .from('document_versions')
        .select('version_number')
        .eq('document_id', id)
        .order('version_number', { ascending: false })
        .limit(1);
      
      if (vError) throw vError;
      const nextVersion = (versions?.[0]?.version_number || 1) + 1;

      // 2. Insert into document_versions
      const { error: insertVError } = await admin
        .from('document_versions')
        .insert([{
          document_id: id,
          version_number: nextVersion,
          file_url,
          file_type,
          file_size,
          changes_summary: changes_summary || `Updated to version ${nextVersion}`
        }]);
      
      if (insertVError) throw insertVError;

      // 3. Update the main document record to reflect latest file info
      const { data, error } = await admin
        .from('documents')
        .update({
          file_url,
          file_type,
          file_size,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      return NextResponse.json({ success: true, data });

    } else {
      // Initial upload of a new document
      const { data, error } = await admin
        .from('documents')
        .insert([{
          title,
          description,
          category,
          file_url,
          file_type,
          file_size,
          is_important
        }])
        .select();

      if (error) throw error;

      // Create version 1 record
      if (data?.[0]) {
        await admin
          .from('document_versions')
          .insert([{
            document_id: data[0].id,
            version_number: 1,
            file_url,
            file_type,
            file_size,
            changes_summary: 'Initial upload'
          }]);
      }

      return NextResponse.json({ success: true, data });
    }
  } catch (error: any) {
    console.error('Error in POST /api/supabase/documents:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) throw new Error('ID required');

    // Get the document first to get the storage path
    const { data: doc, error: getError } = await admin
      .from('documents')
      .select('file_url')
      .eq('id', id)
      .single();

    if (getError) throw getError;

    // Extract filename from URL (format: .../storage/v1/object/public/documents/filename.pdf)
    if (doc?.file_url) {
      const fileName = doc.file_url.split('/').pop();
      if (fileName) {
        await admin.storage.from('documents').remove([fileName]);
      }
    }

    const { error } = await admin
      .from('documents')
      .delete()
      .match({ id });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
