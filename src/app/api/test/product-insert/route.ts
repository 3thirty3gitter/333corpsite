import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const admin = getSupabaseAdmin();
    
    // Get a user to use as owner (first admin we find)
    const { data: adminUser } = await admin
      .from('employees')
      .select('email')
      .eq('role', 'Admin')
      .limit(1)
      .single();
    
    let userId: string | null = null;
    if (adminUser?.email) {
      const { data: userData } = await admin.auth.admin.listUsers();
      const user = userData?.users?.find(u => u.email === adminUser.email);
      userId = user?.id || null;
    }

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'No admin user found to assign as product owner',
      }, { status: 400 });
    }
    
    // Test insert with minimal data
    const testProduct = {
      name: 'Test Product',
      description: 'Test description',
      price: 29.99,
      category: 'Test',
      sku: `TEST-${Date.now()}`,
      images: [],
      options: [],
      variants: [],
      featured: false,
      active: false, // so it doesn't show up
      source: 'test',
      source_data: { test: true },
      msrp_currency: 'CAD',
      msrp_value: '29.99',
      user_id: userId,
    };

    console.log('🧪 Testing insert with:', JSON.stringify(testProduct, null, 2));

    const { data, error } = await admin
      .from('products')
      .insert(testProduct)
      .select()
      .single();

    if (error) {
      console.error('❌ Insert error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      }, { status: 500 });
    }

    // Clean up - delete the test product
    await admin.from('products').delete().eq('id', data.id);

    return NextResponse.json({ 
      success: true, 
      message: 'Insert test passed!',
      productId: data.id,
    });
  } catch (err) {
    console.error('❌ Test error:', err);
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}
