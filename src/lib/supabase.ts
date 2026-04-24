import { createClient } from '@supabase/supabase-js';

const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE;

export const supabaseClient = publicUrl && publicAnonKey
  ? createClient(publicUrl, publicAnonKey)
  : null;

// Admin client for server usage
export const supabaseAdmin = publicUrl && serviceRoleKey
  ? createClient(publicUrl, serviceRoleKey)
  : null;

export function getSupabaseClient() {
  if (!supabaseClient) throw new Error('Supabase client not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  return supabaseClient;
}

export function getSupabaseAdmin() {
  if (!supabaseAdmin) throw new Error('Supabase admin client not configured. Set SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL.');
  return supabaseAdmin;
}
