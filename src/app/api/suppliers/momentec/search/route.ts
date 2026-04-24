import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

interface MomentecCredentials {
  logonId: string;
  password: string;
}

interface MomentecSearchParams {
  productOrDesignNumber: string;
}

async function requireAdmin(req: Request | NextRequest) {
  const admin = getSupabaseAdmin();
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '') ?? null;
  if (!token) return null;

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return null;
  
  const email = data.user.email;
  const { data: rows } = await admin.from('employees').select('role').eq('email', email).single();
  if (!rows || rows.role !== 'Admin') return null;
  
  return { user: data.user, email };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Require admin authentication
    const identity = await requireAdmin(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body - must be valid JSON' },
        { status: 400 }
      );
    }
    
    const { productOrDesignNumber } = body as MomentecSearchParams;

    // Validate product number
    if (!productOrDesignNumber || typeof productOrDesignNumber !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid parameter: productOrDesignNumber must be a non-empty string' },
        { status: 400 }
      );
    }
    
    const trimmedProductNumber = productOrDesignNumber.trim();
    if (trimmedProductNumber.length === 0) {
      return NextResponse.json(
        { error: 'productOrDesignNumber cannot be empty' },
        { status: 400 }
      );
    }
    
    console.log('🔍 [momentec/search] Searching for product:', trimmedProductNumber);

    // Load Momentec credentials from supplier_settings
    const admin = getSupabaseAdmin();
    const { data: settingsData, error: settingsError } = await admin
      .from('supplier_settings')
      .select('*')
      .eq('id', 'momentec')
      .single();

    if (settingsError || !settingsData) {
      console.log('⚠️ [momentec/search] Settings not found');
      return NextResponse.json(
        { error: 'Momentec credentials not configured. Please configure in Settings → Integrations' },
        { status: 400 }
      );
    }

    const momentec = settingsData;
    const creds = momentec.credentials as { logonId?: string; password?: string } | null;

    console.log('🔑 [momentec/search] Momentec settings:', { 
      enabled: momentec.enabled, 
      hasLogonId: !!creds?.logonId, 
      hasPassword: !!creds?.password 
    });

    if (!momentec.enabled || !creds?.logonId || !creds?.password) {
      return NextResponse.json(
        { error: 'Momentec integration not enabled or credentials missing. Please configure in Settings → Integrations' },
        { status: 400 }
      );
    }

    const credentials: MomentecCredentials = {
      logonId: creds.logonId,
      password: creds.password,
    };

    // Use staging API for development, production for live
    const isProduction = process.env.NODE_ENV === 'production' && !process.env.MOMENTEC_USE_STAGING;
    const apiUrl = isProduction 
      ? 'https://api.momentecbrands.com/v2/Style'
      : 'https://stage-api.momentecbrands.ca/v2/Style';
    
    console.log('🔍 [momentec/search] Calling Momentec API:', apiUrl, '(production:', isProduction, ')');
    
    // Retry logic for network failures
    const maxRetries = 2;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔍 [momentec/search] Attempt ${attempt}/${maxRetries}`);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productOrDesignNumber: trimmedProductNumber,
            credentials: {
              logonId: credentials.logonId,
              password: credentials.password,
            },
          }),
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });

        if (!response.ok) {
          let errorDetails;
          try {
            errorDetails = await response.json();
          } catch {
            errorDetails = await response.text();
          }
          
          console.error('❌ [momentec/search] API error:', {
            status: response.status,
            statusText: response.statusText,
            details: errorDetails,
            attempt,
          });
          
          // Don't retry on auth errors (401) or not found (404)
          if (response.status === 401 || response.status === 404) {
            return NextResponse.json(
              { 
                error: response.status === 401 
                  ? 'Invalid Momentec credentials. Please check your login and password in Settings.'
                  : `Product "${trimmedProductNumber}" not found in Momentec catalog.`,
                details: errorDetails,
                statusCode: response.status,
              },
              { status: 400 }
            );
          }
          
          // Retry on server errors (5xx)
          if (response.status >= 500 && attempt < maxRetries) {
            const backoffMs = 1000 * attempt;
            console.log(`⏳ [momentec/search] Server error, retrying in ${backoffMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffMs));
            continue;
          }
          
          return NextResponse.json(
            { 
              error: `Momentec API error: ${response.status} ${response.statusText}`, 
              details: errorDetails,
              statusCode: response.status,
            },
            { status: 400 }
          );
        }

        const data = await response.json();
        
        console.log('✅ [momentec/search] API response received:', {
          hasProductInfo: !!data.productInfo,
          productCount: data.productInfo?.length || 0,
        });
        
        // Log the raw data structure to debug image/MSRP issues
        if (data.productInfo?.[0]) {
          const first = data.productInfo[0];
          console.log('🔍 [momentec/search] Raw product structure:', {
            keys: Object.keys(first),
            MSRP: first.MSRP,
            msrp: first.msrp,
            Images: first.Images,
            images: first.images,
            imageKeys: first.Images ? Object.keys(first.Images) : first.images ? Object.keys(first.images) : null,
          });
        }

        // Transform response to our format
        const products = data.productInfo?.map((productInfo: any) => {
          // MSRP is an array like [{ currency: 'USD', value: '37.00' }, { currency: 'CAD', value: '50.00' }]
          // Prefer CAD, fallback to USD if CAD is 0 or missing
          let msrp = { currency: 'CAD', value: '0.00' };
          const msrpArray = productInfo.MSRP || productInfo.msrp;
          if (Array.isArray(msrpArray)) {
            const cadPrice = msrpArray.find((p: any) => p.currency === 'CAD');
            const usdPrice = msrpArray.find((p: any) => p.currency === 'USD');
            // Use CAD if it has a non-zero value, otherwise fall back to USD
            if (cadPrice && parseFloat(cadPrice.value) > 0) {
              msrp = cadPrice;
            } else if (usdPrice && parseFloat(usdPrice.value) > 0) {
              // Convert USD to CAD (rough estimate - you may want to use a proper exchange rate)
              const usdValue = parseFloat(usdPrice.value);
              msrp = { currency: 'CAD', value: (usdValue * 1.35).toFixed(2) };
            }
          } else if (msrpArray && typeof msrpArray === 'object') {
            msrp = msrpArray;
          }
          
          // Images might just have imageURL, or the full structure
          const rawImages = productInfo.Images || productInfo.images;
          let images = null;
          if (rawImages) {
            // If it's just an imageURL, use that as the main image
            if (rawImages.imageURL) {
              images = {
                front: rawImages.imageURL,
                hero: rawImages.imageURL,
              };
            } else {
              // Full structure
              images = {
                front: rawImages.front || rawImages.Front,
                back: rawImages.back || rawImages.Back,
                left: rawImages.lside || rawImages.Lside || rawImages.left || rawImages.Left,
                right: rawImages.rside || rawImages.Rside || rawImages.right || rawImages.Right,
                leftQuarter: rawImages.lquarter || rawImages.Lquarter || rawImages.leftQuarter,
                hero: rawImages.heroImage || rawImages.HeroImage || rawImages.hero || rawImages.Hero,
              };
            }
          }
          
          return {
            styleNumber: productInfo.productOrDesignNumber,
            name: productInfo.Name || productInfo.name,
            msrp: msrp,
            images: images,
            altImages: productInfo.altImages || productInfo.AltImages || [],
            variants: productInfo.items?.map((item: any) => {
              // Try to get size from various possible fields
              let sizeName = item.sizeName || item.size || item.Size;
              
              // If no size field, parse from SKU (e.g., "229671.017.L" -> "L")
              if (!sizeName && item.SKU) {
                const skuParts = item.SKU.split('.');
                const lastPart = skuParts[skuParts.length - 1];
                if (lastPart && /^(\d*)(XS|S|M|L|XL|XXL|XXXL)$/i.test(lastPart)) {
                  sizeName = lastPart.toUpperCase();
                }
              }
              
              return {
                sku: item.SKU,
                colorName: item.colorName,
                sizeName: sizeName,
                quantity: item.quantity,
              };
            }) || [],
            rawData: productInfo,
          };
        }) || [];

        const elapsedTime = Date.now() - startTime;
        console.log(`✅ [momentec/search] Search completed in ${elapsedTime}ms, found ${products.length} products`);

        return NextResponse.json({ 
          products,
          searchTime: elapsedTime,
          productCount: products.length,
        });
        
      } catch (fetchError) {
        lastError = fetchError instanceof Error ? fetchError : new Error(String(fetchError));
        
        if (lastError.name === 'AbortError' || lastError.message.includes('timeout')) {
          console.error(`❌ [momentec/search] Request timeout on attempt ${attempt}`);
          if (attempt < maxRetries) {
            continue;
          }
        }
        
        console.error(`❌ [momentec/search] Network error on attempt ${attempt}:`, lastError.message);
        if (attempt < maxRetries) {
          const backoffMs = 1000 * attempt;
          await new Promise(resolve => setTimeout(resolve, backoffMs));
          continue;
        }
      }
    }
    
    const elapsedTime = Date.now() - startTime;
    console.error(`❌ [momentec/search] All ${maxRetries} attempts failed after ${elapsedTime}ms`);
    
    return NextResponse.json(
      { 
        error: 'Failed to search Momentec catalog after multiple attempts',
        details: lastError?.message || 'Network error',
        attempts: maxRetries,
      },
      { status: 500 }
    );
    
  } catch (error) {
    const elapsedTime = Date.now() - startTime;
    console.error(`❌ [momentec/search] Outer error after ${elapsedTime}ms:`, error);
    return NextResponse.json(
      { error: 'Failed to search products', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
