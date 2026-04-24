import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import * as cheerio from 'cheerio';

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
 * - Empty/whitespace SKUs → throws error
 * - Special characters → sanitized
 * - Unknown categories → fallback to print-products
 * - Very short SKUs → warns but attempts conversion
 * - Multiple separators → normalized
 */
function convertSkuToUrl(sku: string): string {
  // Edge case: validate input
  if (!sku || typeof sku !== 'string') {
    throw new Error('SKU must be a non-empty string');
  }
  
  const trimmedSku = sku.trim();
  if (!trimmedSku) {
    throw new Error('SKU cannot be empty or whitespace');
  }
  
  // Edge case: warn about very short SKUs (likely typos or invalid)
  if (trimmedSku.length < 3) {
    console.warn(`⚠️  Very short SKU detected: "${trimmedSku}" - may not match correctly`);
  }
  
  // Normalize: lowercase and sanitize special characters
  let skuLower = trimmedSku.toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')  // Replace special chars with underscores
    .replace(/_+/g, '_')            // Collapse multiple underscores
    .replace(/^_|_$/g, '');         // Remove leading/trailing underscores
  
  // Edge case: after sanitization, check if still valid
  if (!skuLower) {
    throw new Error(`SKU "${sku}" contains only special characters`);
  }
  
  // Pattern: {product-type}_{specs}
  // Examples:
  // - businesscard_14pt_profit_maximizer → /business-cards/14pt-profit-maximizer.html
  // - postcard_10pt_matte → /postcards/10pt-matte.html
  
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
  
  // Edge case: no category matched - use generic fallback
  if (!matched) {
    console.warn(`⚠️  SKU "${sku}" didn't match any known category - using fallback`);
    category = 'print-products';
    productPath = skuLower.replace(/_/g, '-');
  }
  
  // Edge case: ensure product path is not empty after conversion
  if (!productPath) {
    console.warn(`⚠️  SKU "${sku}" resulted in empty product path - using full SKU`);
    productPath = skuLower.replace(/_/g, '-');
  }
  
  return `https://sinalite.com/en_ca/${category}/${productPath}.html`;
}

/**
 * Attempt to find the product URL via SinaLite search when direct URL fails.
 * This is a fallback for edge cases where SKU conversion doesn't work.
 */
async function findProductViaSearch(sku: string, productName?: string): Promise<string | null> {
  try {
    const searchTerm = productName || sku;
    const searchUrl = `https://sinalite.com/en_ca/catalogsearch/result/?q=${encodeURIComponent(searchTerm)}`;
    
    console.log(`🔍 Attempting fallback search for "${searchTerm}"...`);
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(8000)
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Look for product links in search results
    const firstProductLink = $('.product-item-link').first().attr('href');
    
    if (firstProductLink && firstProductLink.includes('sinalite.com')) {
      console.log(`✅ Found product via search: ${firstProductLink}`);
      return firstProductLink;
    }
    
    return null;
  } catch (error) {
    console.error('Search fallback failed:', error);
    return null;
  }
}

async function requireAdmin(req: Request | NextRequest) {
  const adminClient = getSupabaseAdmin();
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '') ?? null;
  
  if (!token) return null;

  const { data, error } = await adminClient.auth.getUser(token);
  if (error || !data?.user) return null;
  
  const email = data.user.email;
  const { data: rows, error: roleError } = await adminClient
    .from('employees')
    .select('role')
    .eq('email', email)
    .single();
  
  if (roleError || !rows || rows.role !== 'Admin') return null;
  
  return { user: data.user, email, userId: data.user.id };
}

export async function POST(request: NextRequest) {
  try {
    const identity = await requireAdmin(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, sku, productName } = await request.json();

    // Edge case: validate SKU presence and format
    if (!sku) {
      return NextResponse.json({ error: 'SKU is required' }, { status: 400 });
    }
    
    if (typeof sku !== 'string' || !sku.trim()) {
      return NextResponse.json({ 
        error: 'SKU must be a non-empty string',
        received: typeof sku
      }, { status: 400 });
    }

    // Convert SKU to actual SinaLite URL pattern
    let url: string;
    try {
      url = convertSkuToUrl(sku);
    } catch (conversionError: any) {
      return NextResponse.json({ 
        error: `Invalid SKU format: ${conversionError.message}`,
        sku
      }, { status: 400 });
    }
    
    console.log(`🔍 Scraping SinaLite images for SKU: ${sku} at ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    // Edge case: 404 response - try fallback search
    if (!response.ok) {
      console.warn(`Could not fetch SinaLite product page for SKU ${sku}:`, response.status);
      
      // Attempt fallback search if primary URL failed
      if (response.status === 404) {
        console.log(`⚠️  Primary URL failed (404) - attempting fallback search...`);
        const fallbackUrl = await findProductViaSearch(sku, productName);
        
        if (fallbackUrl) {
          // Try scraping the discovered URL
          console.log(`🔄 Retrying with discovered URL: ${fallbackUrl}`);
          const fallbackResponse = await fetch(fallbackUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            signal: AbortSignal.timeout(10000)
          });
          
          if (fallbackResponse.ok) {
            // Continue with scraping using the fallback URL
            const html = await fallbackResponse.text();
            return await scrapeImagesFromHtml(html, sku, fallbackUrl, productId);
          }
        }
      }
      
      return NextResponse.json({ 
        error: `Could not reach SinaLite product page. The SKU "${sku}" may not exist, the page may be unavailable, or the URL pattern may be incorrect.`,
        attemptedUrl: url,
        status: response.status,
        suggestion: 'Try checking the product name or SKU format'
      }, { status: 404 });
    }

    const html = await response.text();
    return await scrapeImagesFromHtml(html, sku, url, productId);
  } catch (error: any) {
    console.error('Error scraping SinaLite images:', error);
    return NextResponse.json({ 
      error: 'Failed to scrape images',
      details: error.message 
    }, { status: 500 });
  }
}

/**
 * Extract images from HTML content.
 * Separated into its own function for reuse with fallback URLs.
 */
async function scrapeImagesFromHtml(html: string, sku: string, sourceUrl: string, productId?: number) {
  const $ = cheerio.load(html);
  
  // Look for product images - comprehensive scraping
  const images: string[] = [];
  
  // Strategy 1: OpenGraph image (most reliable)
  const ogImage = $('meta[property="og:image"]').attr('content');
  if (ogImage) images.push(ogImage);

  // Strategy 2: All img tags in product gallery/media sections
  $('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy');
    if (src && !images.includes(src)) images.push(src);
  });

  // Strategy 3: Data attributes that might contain image URLs
  $('[data-image], [data-zoom-image], [data-full-image]').each((_, el) => {
    const dataImage = $(el).attr('data-image') || $(el).attr('data-zoom-image') || $(el).attr('data-full-image');
    if (dataImage && !images.includes(dataImage)) images.push(dataImage);
  });

  // Strategy 4: Schema.org markup
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '{}');
      const img = data.image || data[0]?.image;
      if (img) {
        if (Array.isArray(img)) images.push(...img);
        else images.push(img);
      }
    } catch (e) {}
  });

  // Strategy 5: Look in JavaScript/JSON data blocks
  $('script:not([src])').each((_, el) => {
    const content = $(el).html() || '';
    // Look for URLs that end in common image extensions
    const urlMatches = content.match(/https?:\/\/[^\s"']+\.(jpg|jpeg|png|gif|webp)/gi);
    if (urlMatches) {
      images.push(...urlMatches);
    }
  });

  // Clean and normalize URLs
  const activeImages = [...new Set(images)]
    .filter(img => img && (img.startsWith('http') || img.startsWith('//')))
    .map(img => {
      // Convert protocol-relative URLs to https
      if (img.startsWith('//')) return 'https:' + img;
      return img;
    })
    .map(img => img.split('?')[0]) // Remove query params
    .filter(img => {
      // Only keep valid image URLs
      return /\.(jpg|jpeg|png|gif|webp)$/i.test(img) || img.includes('/media/') || img.includes('/image/');
    });

  if (activeImages.length === 0) {
    console.warn(`No images found on SinaLite page for SKU ${sku}`);
    return NextResponse.json({ 
      error: 'No product images found on page. The page may have loaded but contains no visible images.', 
      url: sourceUrl,
      debug: {
        htmlLength: html.length,
        totalImgTags: $('img').length,
        hasOgImage: !!ogImage
      }
    }, { status: 404 });
  }

  console.log(`✅ Found ${activeImages.length} images for SKU ${sku}`);
  console.log('Images:', activeImages);

  // Update the product record in Supabase if productId is provided
  if (productId) {
    const admin = getSupabaseAdmin();
    const { error: updateError } = await admin
      .from('products')
      .update({ 
        images: activeImages,
        featured_image: activeImages[0] 
      })
      .eq('id', productId);

    if (updateError) {
      console.error('Update error:', updateError);
    }
  }

  return NextResponse.json({
    success: true,
    sku,
    images: activeImages,
    count: activeImages.length,
    url: sourceUrl
  });
}
