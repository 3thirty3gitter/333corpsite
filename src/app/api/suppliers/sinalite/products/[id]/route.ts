import { NextRequest, NextResponse } from 'next/server';
import { getSinaLiteConfig } from '../../auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { baseUrl, token, storeCode } = await getSinaLiteConfig();
    
    // Fetch product details with pricing (using storeCode)
    const response = await fetch(`${baseUrl}/product/${id}/${storeCode}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      const errorText = await response.text();
      console.error('SinaLite product fetch error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch product from SinaLite' },
        { status: response.status }
      );
    }
    
    const product = await response.json();
    
    // Fetch variants if available
    let variants: any[] = [];
    try {
      const variantsResponse = await fetch(`${baseUrl}/variants/${id}/0`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (variantsResponse.ok) {
        const variantsData = await variantsResponse.json();
        variants = Array.isArray(variantsData) ? variantsData : (variantsData.variants || []);
      }
    } catch (e) {
      console.log('No variants available for product:', id);
    }
    
    // Transform to unified format
    const transformedProduct = {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      category: product.category,
      enabled: product.enabled,
      source: 'sinalite',
      source_id: String(product.id),
      price: product.price || null,
      pricing: product.pricing || null,
      options: product.options || [],
      variants: variants.map((v: any) => ({
        id: v.id,
        sku: v.sku,
        name: v.name,
        options: v.options || {},
      })),
      images: product.images || [],
    };
    
    return NextResponse.json(transformedProduct);
    
  } catch (error) {
    console.error('SinaLite product detail error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch product details' },
      { status: 500 }
    );
  }
}
