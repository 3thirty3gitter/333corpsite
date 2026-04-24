import { NextRequest, NextResponse } from 'next/server';
import { getSinaLiteConfig } from '../auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Get SinaLite configuration
    const { baseUrl, token } = await getSinaLiteConfig();
    
    // Build headers - token is optional for product listing
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Fetch products from SinaLite
    const response = await fetch(`${baseUrl}/product`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('SinaLite API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch products from SinaLite' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Filter and transform products
    let products = Array.isArray(data) ? data : (data.products || []);
    
    // Apply search filter if query provided
    if (query) {
      const searchLower = query.toLowerCase();
      products = products.filter((p: any) => 
        p.name?.toLowerCase().includes(searchLower) ||
        p.sku?.toLowerCase().includes(searchLower) ||
        p.category?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply category filter if provided
    if (category) {
      products = products.filter((p: any) => 
        p.category?.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Get unique categories for filtering
    const categories = [...new Set(products.map((p: any) => p.category).filter(Boolean))];
    
    // Pagination
    const total = products.length;
    const startIndex = (page - 1) * limit;
    const paginatedProducts = products.slice(startIndex, startIndex + limit);
    
    // Transform to unified format
    const transformedProducts = paginatedProducts.map((product: any) => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category,
      enabled: product.enabled,
      source: 'sinalite',
      source_id: String(product.id),
    }));
    
    return NextResponse.json({
      products: transformedProducts,
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
    
  } catch (error) {
    console.error('SinaLite search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search SinaLite products' },
      { status: 500 }
    );
  }
}
