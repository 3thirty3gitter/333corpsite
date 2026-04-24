// SinaLite OAuth2 Authentication Helper
import { getSupabaseAdmin } from '@/lib/supabase';

const STAGING_URL = 'https://api.sinaliteuppy.com';
const LIVE_URL = 'https://liveapi.sinalite.com';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

// In-memory token cache (per environment)
const tokenCache: { staging?: CachedToken; live?: CachedToken } = {};

export async function getSinaLiteToken(useProduction = false): Promise<string> {
  const cacheKey = useProduction ? 'live' : 'staging';
  const cached = tokenCache[cacheKey];
  
  // Return cached token if still valid (with 5 min buffer)
  if (cached && cached.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cached.token;
  }
  
  // Get credentials from database
  const supabase = getSupabaseAdmin();
  
  const { data: settings, error } = await supabase
    .from('supplier_settings')
    .select('credentials')
    .eq('id', 'sinalite')
    .single();
  
  if (error || !settings) {
    throw new Error('SinaLite credentials not configured');
  }
  
  const { client_id, client_secret, use_production } = settings.credentials;
  
  if (!client_id || !client_secret) {
    throw new Error('SinaLite client_id and client_secret are required');
  }
  
  const baseUrl = use_production ? LIVE_URL : STAGING_URL;
  
  // Request OAuth2 token
  const response = await fetch(`${baseUrl}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id,
      client_secret,
      audience: 'https://apiconnect.sinalite.com',
      grant_type: 'client_credentials',
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SinaLite auth failed: ${response.status} - ${errorText}`);
  }
  
  const data: TokenResponse = await response.json();
  
  // Cache the token (default 24h expiry if not specified)
  const expiresIn = data.expires_in || 86400;
  tokenCache[cacheKey] = {
    token: data.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  };
  
  return data.access_token;
}

export function getSinaLiteBaseUrl(useProduction = false): string {
  return useProduction ? LIVE_URL : STAGING_URL;
}

export async function getSinaLiteConfig(): Promise<{
  baseUrl: string;
  token: string;
  storeCode: number;
}> {
  const supabase = getSupabaseAdmin();
  
  const { data: settings } = await supabase
    .from('supplier_settings')
    .select('credentials')
    .eq('id', 'sinalite')
    .single();
  
  const useProduction = settings?.credentials?.use_production || false;
  const storeCode = settings?.credentials?.store_code || 6; // Default to Canada
  
  // Token is optional - SinaLite API works without auth for product listing
  let token = '';
  try {
    if (settings?.credentials?.client_id && settings?.credentials?.client_secret) {
      token = await getSinaLiteToken(useProduction);
    }
  } catch {
    // Token not required for basic product listing
  }
  
  const baseUrl = getSinaLiteBaseUrl(useProduction);
  
  return { baseUrl, token, storeCode };
}
