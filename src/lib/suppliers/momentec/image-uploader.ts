import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Convert a string to SEO-friendly format
 * Example: "Bella+Canvas 3001" -> "bella-canvas-3001"
 */
function toSeoFriendly(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50); // Limit length
}

/**
 * Download an image from a URL and upload it to Supabase Storage
 * @param imageUrl - The source image URL
 * @param path - The storage path (e.g., 'productId/image1.jpg')
 * @returns The public URL of the uploaded image
 */
export async function downloadAndUploadImage(
  imageUrl: string,
  path: string
): Promise<string> {
  try {
    console.log(`📥 Downloading image: ${imageUrl}`);

    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.storage
      .from('products')
      .upload(path, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // Get the public URL
    const { data: { publicUrl } } = admin.storage
      .from('products')
      .getPublicUrl(path);
    
    console.log(`✅ Uploaded image to: ${publicUrl}`);
    return publicUrl;

  } catch (error) {
    console.error(`❌ Failed to upload image ${imageUrl}:`, error);
    // Return original URL as fallback
    return imageUrl;
  }
}

/**
 * Download and upload multiple images in parallel
 * @param images - Array of {url: string, fileName: string, productName?: string, colorName?: string}
 * @param productId - The product ID for organizing storage
 * @param productName - The product name for SEO-friendly filenames
 * @returns Array of public URLs
 */
export async function downloadAndUploadImages(
  images: Array<{ url: string; fileName: string; productName?: string; colorName?: string }>,
  productId: string,
  productName?: string
): Promise<string[]> {
  const baseName = productName ? toSeoFriendly(productName) : 'product';
  
  const uploadPromises = images.map(async ({ url, fileName, colorName }, index) => {
    const extension = fileName.split('.').pop() || 'jpg';
    
    // Build SEO-friendly filename: "product-name-color-1.jpg"
    let seoFileName = baseName;
    if (colorName) {
      seoFileName += `-${toSeoFriendly(colorName)}`;
    }
    seoFileName += `-${index + 1}.${extension}`;
    
    const path = `${productId}/${seoFileName}`;
    return downloadAndUploadImage(url, path);
  });

  return Promise.all(uploadPromises);
}
