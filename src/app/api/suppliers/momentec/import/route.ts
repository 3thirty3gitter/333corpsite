import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

interface MomentecProduct {
  styleNumber: string;
  name: string;
  msrp: {
    currency: string;
    value: string;
  };
  images: {
    front?: string;
    back?: string;
    left?: string;
    right?: string;
    leftQuarter?: string;
    hero?: string;
  };
  altImages?: string[];
  variants: {
    sku: string;
    colorName: string;
    sizeName: string;
    quantity: number;
  }[];
  rawData: any;
}

interface ImportRequest {
  product: MomentecProduct;
  category?: string;
}

async function requireAdmin(req: Request | NextRequest) {
  const adminClient = getSupabaseAdmin();
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '') ?? null;
  
  console.log('🔐 [requireAdmin] Auth header present:', !!authHeader);
  console.log('🔐 [requireAdmin] Token extracted:', !!token);
  
  if (!token) {
    console.log('❌ [requireAdmin] No token found');
    return null;
  }

  const { data, error } = await adminClient.auth.getUser(token);
  if (error || !data?.user) {
    console.log('❌ [requireAdmin] Auth error:', error?.message);
    return null;
  }
  
  const email = data.user.email;
  console.log('🔐 [requireAdmin] User email:', email);
  
  const { data: rows, error: roleError } = await adminClient.from('employees').select('role').eq('email', email).single();
  
  if (roleError) {
    console.log('❌ [requireAdmin] Role lookup error:', roleError.message);
    return null;
  }
  
  if (!rows || rows.role !== 'Admin') {
    console.log('❌ [requireAdmin] Not admin. Role:', rows?.role);
    return null;
  }
  
  console.log('✅ [requireAdmin] Admin verified:', email);
  return { user: data.user, email, userId: data.user.id };
}

export async function POST(request: NextRequest) {
  try {
    console.log('📦 [momentec/import] Starting import...');
    
    // Check if admin client is available
    let admin;
    try {
      admin = getSupabaseAdmin();
      console.log('✅ [momentec/import] Admin client initialized');
    } catch (adminError) {
      console.error('❌ [momentec/import] Failed to get admin client:', adminError);
      return NextResponse.json(
        { error: 'Server configuration error', details: 'Supabase admin client not configured' },
        { status: 500 }
      );
    }
    
    // Require admin authentication
    const identity = await requireAdmin(request);
    if (!identity) {
      console.log('❌ [momentec/import] Unauthorized - no valid admin identity');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('✅ [momentec/import] Admin verified:', identity.email);

    const body = await request.json();
    console.log('📦 [momentec/import] Request body keys:', Object.keys(body));
    
    const { product, category = 'Apparel' } = body as ImportRequest;

    if (!product) {
      console.error('❌ [momentec/import] Missing product');
      return NextResponse.json(
        { error: 'Missing required parameters', details: { hasProduct: false } },
        { status: 400 }
      );
    }

    // Validate product structure
    if (!product.styleNumber || !product.name) {
      console.error('❌ [momentec/import] Invalid product structure');
      return NextResponse.json(
        { 
          error: 'Invalid product structure',
          details: {
            hasStyleNumber: !!product.styleNumber,
            hasName: !!product.name,
          }
        },
        { status: 400 }
      );
    }

    // Check if product already exists
    const { data: existingProduct } = await admin
      .from('products')
      .select('id')
      .eq('sku', product.styleNumber)
      .eq('source', 'momentec')
      .single();

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product already exists', productId: existingProduct.id },
        { status: 409 }
      );
    }

    // Collect all unique images
    const allImages: string[] = [];
    if (product.images?.hero) allImages.push(product.images.hero);
    if (product.images?.front) allImages.push(product.images.front);
    if (product.images?.back) allImages.push(product.images.back);
    if (product.images?.left) allImages.push(product.images.left);
    if (product.images?.right) allImages.push(product.images.right);
    if (product.images?.leftQuarter) allImages.push(product.images.leftQuarter);
    if (product.altImages) allImages.push(...product.altImages);

    // Remove duplicates
    const uniqueImageUrls = [...new Set(allImages.filter(Boolean))];
    
    console.log(`📸 [momentec/import] Found ${uniqueImageUrls.length} unique images`);
    
    // Create image objects (we'll store the original URLs for now)
    // In production, you'd want to download and re-host these
    const images = uniqueImageUrls.map((url, index) => ({
      id: `img-${index}`,
      src: url,
      thumbnailSrc: url,
      alt: `${product.name} - Image ${index + 1}`,
      hint: index === 0 ? 'primary' : 'additional',
    }));

    // Extract unique colors and sizes from variants
    const colors = [...new Set(product.variants.map(v => v.colorName).filter(Boolean))];
    const sizes = [...new Set(product.variants.map(v => v.sizeName).filter(Boolean))];

    console.log('📦 [momentec/import] Extracted options:', { colors, sizes });

    // Parse MSRP
    const msrpValue = product.msrp?.value || '0';
    const priceMatch = msrpValue.match(/[\d.]+/);
    const basePrice = priceMatch ? parseFloat(priceMatch[0]) : 0;

    // Create options array
    const options: any[] = [];
    if (colors.length > 0) {
      options.push({ name: 'Color', values: colors });
    }
    if (sizes.length > 0) {
      options.push({ name: 'Size', values: sizes });
    }

    // Create variants array
    const firstImageId = images.length > 0 ? images[0].id : null;
    const variants = product.variants.map((variant, index) => {
      const titleParts: string[] = [];
      if (variant.colorName) titleParts.push(variant.colorName);
      if (variant.sizeName) titleParts.push(variant.sizeName);
      const title = titleParts.length > 0 ? titleParts.join(' / ') : 'Default Title';
      
      return {
        id: `variant-${index}`,
        title,
        option1: variant.colorName || '',
        option2: variant.sizeName || '',
        option3: '',
        price: basePrice,
        sku: variant.sku,
        inventoryQuantity: variant.quantity || 0,
        inventoryManagement: 'tracked',
        imageId: firstImageId,
      };
    });

    // Create product document
    const productData = {
      name: product.name,
      description: `${product.name}\nStyle: ${product.styleNumber}\nMSRP: ${product.msrp?.currency || 'CAD'} ${msrpValue}`,
      price: basePrice,
      category,
      sku: product.styleNumber,
      images,
      options,
      variants,
      featured: false,
      active: true,
      source: 'momentec',
      source_data: {
        styleNumber: product.styleNumber,
        msrp: product.msrp,
        importedAt: new Date().toISOString(),
      },
      msrp_currency: product.msrp?.currency || 'CAD',
      msrp_value: msrpValue,
      user_id: identity.userId, // Required by products table
    };

    // Insert into Supabase
    const { data: newProduct, error: insertError } = await admin
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ [momentec/import] Insert error:', JSON.stringify(insertError, null, 2));
      console.error('❌ [momentec/import] Insert error code:', insertError.code);
      console.error('❌ [momentec/import] Insert error message:', insertError.message);
      console.error('❌ [momentec/import] Insert error details:', insertError.details);
      return NextResponse.json(
        { error: 'Failed to import product', details: insertError.message, code: insertError.code },
        { status: 500 }
      );
    }

    console.log(`✅ [momentec/import] Product imported: ${newProduct.id}`);

    return NextResponse.json({
      success: true,
      productId: newProduct.id,
      variantCount: variants.length,
      imageCount: images.length,
    });
  } catch (error) {
    console.error('❌ [momentec/import] Outer catch error:', error);
    console.error('❌ [momentec/import] Error type:', typeof error);
    console.error('❌ [momentec/import] Error name:', error instanceof Error ? error.name : 'unknown');
    console.error('❌ [momentec/import] Error message:', error instanceof Error ? error.message : String(error));
    console.error('❌ [momentec/import] Error stack:', error instanceof Error ? error.stack : 'no stack');
    return NextResponse.json(
      { error: 'Failed to import product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
