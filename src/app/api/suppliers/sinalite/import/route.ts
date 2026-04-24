import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getSinaLiteConfig } from '../auth';
import * as cheerio from 'cheerio';

interface ImportRequest {
  productId: number | number[];
}

interface SinaLiteOption {
  id: number;
  group: string;
  name: string;
  hidden: number;
}

interface SinaLiteVariant {
  price: number;
  key: string;
}

/**
 * Category mapping for SinaLite products.
 * Maps SKU prefixes to their category paths on the website.
 */
const CATEGORY_MAP = [
  { prefixes: ['businesscard_', 'business_card_', 'bc_'], category: 'business-cards', remove: /^(business_?card_|bc_)/ },
  { prefixes: ['postcard_', 'pc_'], category: 'postcards', remove: /^(postcard_|pc_)/ },
  { prefixes: ['flyer_'], category: 'flyers', remove: /^flyer_/ },
  { prefixes: ['brochure_'], category: 'brochures', remove: /^brochure_/ },
  { prefixes: ['poster_'], category: 'posters', remove: /^poster_/ },
  { prefixes: ['banner_'], category: 'banners', remove: /^banner_/ },
  { prefixes: ['envelope_', 'env_'], category: 'envelopes', remove: /^(envelope_|env_)/ },
  { prefixes: ['sticker_', 'label_'], category: 'stickers-labels', remove: /^(sticker_|label_)/ },
  { prefixes: ['bookmark_'], category: 'bookmarks', remove: /^bookmark_/ },
  { prefixes: ['letterhead_'], category: 'letterheads', remove: /^letterhead_/ },
  { prefixes: ['notepad_'], category: 'notepads', remove: /^notepad_/ },
  { prefixes: ['presentation_folder_', 'folder_'], category: 'presentation-folders', remove: /^(presentation_folder_|folder_)/ },
];

/**
 * Convert SinaLite SKU to the actual product URL pattern on their website.
 * SinaLite uses category-based URLs like /en_ca/{category}/{product-name}.html
 * 
 * Edge cases handled:
 * - Empty/whitespace SKUs → returns null
 * - Special characters → sanitized
 * - Unknown categories → fallback to print-products
 * - Very short SKUs → warns but attempts conversion
 */
function convertSkuToUrl(sku: string): string | null {
  if (!sku || typeof sku !== 'string') return null;
  
  const trimmedSku = sku.trim();
  if (!trimmedSku) return null;
  
  if (trimmedSku.length < 3) {
    console.warn(`⚠️  Very short SKU detected: "${trimmedSku}" - may not match correctly`);
  }
  
  // Normalize: lowercase and sanitize special characters
  let skuLower = trimmedSku.toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  if (!skuLower) return null;
  
  let category = '';
  let productPath = '';
  let matched = false;
  
  // Try to match against known categories
  for (const mapping of CATEGORY_MAP) {
    for (const prefix of mapping.prefixes) {
      if (skuLower.startsWith(prefix)) {
        category = mapping.category;
        productPath = skuLower.replace(mapping.remove, '').replace(/_/g, '-');
        matched = true;
        break;
      }
    }
    if (matched) break;
  }
  
  // Fallback for unknown categories
  if (!matched) {
    category = 'print-products';
    productPath = skuLower.replace(/_/g, '-');
  }
  
  if (!productPath) {
    productPath = skuLower.replace(/_/g, '-');
  }
  
  return `https://sinalite.com/en_ca/${category}/${productPath}.html`;
}

async function scrapeSinaLiteImage(sku: string): Promise<string[] | null> {
  try {
    const url = convertSkuToUrl(sku);
    if (!url) {
      console.warn(`⚠️  Invalid SKU for scraping: "${sku}"`);
      return null;
    }
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      // Short timeout for scraping during import
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      console.warn(`⚠️  Failed to fetch ${url}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const images: string[] = [];
    
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) images.push(ogImage);

    $('.gallery-placeholder__image, .fotorama__img, .product-image-photo').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && !images.includes(src)) images.push(src);
    });

    const activeImages = [...new Set(images)]
      .filter(img => img && img.startsWith('http'))
      .map(img => img.split('?')[0]);

    if (activeImages.length > 0) {
      console.log(`✅ Scraped ${activeImages.length} images for SKU: ${sku}`);
    }
    
    return activeImages.length > 0 ? activeImages : null;
  } catch (e) {
    console.warn(`⚠️  Error scraping images for SKU "${sku}":`, e instanceof Error ? e.message : e);
    return null;
  }
}

async function requireAdmin(req: Request | NextRequest) {
  const adminClient = getSupabaseAdmin();
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '') ?? null;
  
  if (!token) {
    return null;
  }

  const { data, error } = await adminClient.auth.getUser(token);
  if (error || !data?.user) {
    return null;
  }
  
  const email = data.user.email;
  
  const { data: rows, error: roleError } = await adminClient
    .from('employees')
    .select('role')
    .eq('email', email)
    .single();
  
  if (roleError || !rows || rows.role !== 'Admin') {
    return null;
  }
  
  return { user: data.user, email, userId: data.user.id };
}

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const identity = await requireAdmin(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ImportRequest = await request.json();
    
    // Ensure productIds are numbers for comparison with API response
    const productIds = (Array.isArray(body.productId) ? body.productId : [body.productId])
      .map(id => typeof id === 'string' ? parseInt(id, 10) : id)
      .filter(id => !isNaN(id));
    
    if (!productIds.length) {
      return NextResponse.json(
        { error: 'At least one productId is required' },
        { status: 400 }
      );
    }
    
    const { baseUrl, token, storeCode } = await getSinaLiteConfig();
    const admin = getSupabaseAdmin();
    
    const results: { imported: any[]; errors: any[] } = { imported: [], errors: [] };
    
    for (const productId of productIds) {
      try {
        // Step 1: Get basic product info from /product (list endpoint - filter by id)
        const listResponse = await fetch(`${baseUrl}/product`, {
          method: 'GET',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            'Accept': 'application/json',
          },
        });
        
        if (!listResponse.ok) {
          results.errors.push({
            productId,
            error: `Failed to fetch product list: ${listResponse.status}`,
          });
          continue;
        }
        
        const productList = await listResponse.json();
        
        const basicProduct = Array.isArray(productList) 
          ? productList.find((p: any) => p.id === productId)
          : null;
        
        if (!basicProduct) {
          results.errors.push({
            productId,
            error: `Product not found in list (looking for id=${productId})`,
          });
          continue;
        }
        
        // Step 2: Get detailed pricing/options from /product/{id}/{storeCode}
        // This returns [options[], pricing[], metadata[]]
        const detailResponse = await fetch(`${baseUrl}/product/${productId}/${storeCode}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
        
        let options: SinaLiteOption[] = [];
        let pricingData: any[] = [];
        
        if (detailResponse.ok) {
          const detailData = await detailResponse.json();
          if (Array.isArray(detailData) && detailData.length >= 2) {
            options = detailData[0] || [];
            pricingData = detailData[1] || [];
          }
        }
        
        // Step 3: Get variants from /variants/{id}/0
        let variants: SinaLiteVariant[] = [];
        try {
          const variantsResponse = await fetch(`${baseUrl}/variants/${productId}/0`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          });
          
          if (variantsResponse.ok) {
            const variantsData = await variantsResponse.json();
            variants = Array.isArray(variantsData) ? variantsData : [];
          }
        } catch (e) {
          // Variants are optional
        }
        
        // Check if product already exists
        const { data: existing } = await admin
          .from('products')
          .select('id')
          .eq('source', 'sinalite')
          .eq('source_id', String(productId))
          .single();
        
        // Group options by their group for easier display
        const groupedOptions = options.reduce((acc: any, opt: SinaLiteOption) => {
          if (!acc[opt.group]) {
            acc[opt.group] = [];
          }
          acc[opt.group].push({
            id: opt.id,
            name: opt.name,
            hidden: opt.hidden === 1,
          });
          return acc;
        }, {});
        
        // Build a rich description from the options
        const descriptionParts: string[] = [
          `**${basicProduct.name}**`,
          '',
          `Category: ${basicProduct.category}`,
          `SKU: ${basicProduct.sku}`,
          '',
        ];
        
        // Add option groups to description
        const optionGroups = Object.keys(groupedOptions);
        if (optionGroups.length > 0) {
          descriptionParts.push('**Available Options:**');
          for (const group of optionGroups) {
            const visibleOptions = groupedOptions[group]
              .filter((o: any) => !o.hidden)
              .map((o: any) => o.name);
            if (visibleOptions.length > 0) {
              // Show first few options with count if there are more
              const displayOptions = visibleOptions.slice(0, 5);
              const remaining = visibleOptions.length - 5;
              const optionText = remaining > 0 
                ? `${displayOptions.join(', ')} (+${remaining} more)`
                : displayOptions.join(', ');
              descriptionParts.push(`- ${group}: ${optionText}`);
            }
          }
        }
        
        // Get price range from variants
        let minPrice = 0;
        let maxPrice = 0;
        if (variants.length > 0) {
          const prices = variants.map(v => v.price);
          minPrice = Math.min(...prices);
          maxPrice = Math.max(...prices);
          descriptionParts.push('');
          descriptionParts.push(`**Price Range:** $${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)} CAD`);
          descriptionParts.push(`(${variants.length} pricing combinations available)`);
        }
        
        // Attempt to scrape images automatically
        const sku = basicProduct.sku || `SL-${productId}`;
        const scrapedImages = await scrapeSinaLiteImage(sku);

        // Prepare product data
        const productData = {
          name: basicProduct.name,
          description: descriptionParts.join('\n'),
          sku: sku,
          category: basicProduct.category || 'Print Products',
          source: 'sinalite',
          source_id: String(productId),
          variants: variants.length > 0 ? variants.slice(0, 100) : null, // Limit to 100 variants
          options: Object.keys(groupedOptions).length > 0 ? groupedOptions : null,
          images: scrapedImages, // Use scraped images if found
          featured_image: scrapedImages ? scrapedImages[0] : null,
          active: basicProduct.enabled === 1,
          featured: false,
          price: minPrice > 0 ? minPrice : 0, // Required field - use minimum variant price
          msrp_currency: 'CAD',
          msrp_value: minPrice > 0 ? String(minPrice.toFixed(2)) : null,
          user_id: identity.userId, // Required by products table
        };
        
        let result;
        
        if (existing) {
          // Update existing product
          const { data, error } = await admin
            .from('products')
            .update(productData)
            .eq('id', existing.id)
            .select()
            .single();
          
          if (error) throw error;
          result = { ...data, action: 'updated' };
        } else {
          // Insert new product
          const { data, error } = await admin
            .from('products')
            .insert(productData)
            .select()
            .single();
          
          if (error) throw error;
          result = { ...data, action: 'created' };
        }
        
        results.imported.push(result);
        
      } catch (error: any) {
        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null) {
          // Supabase errors have message, code, details
          errorMessage = error.message || error.code || error.details || JSON.stringify(error);
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        results.errors.push({
          productId,
          error: errorMessage,
        });
      }
    }
    
    return NextResponse.json({
      success: results.imported.length > 0,
      imported: results.imported.length,
      errors: results.errors.length,
      details: results,
      // Include first error message for easier debugging
      error: results.errors.length > 0 ? results.errors[0].error : undefined,
    });
    
  } catch (error) {
    console.error('SinaLite import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import products' },
      { status: 500 }
    );
  }
}
