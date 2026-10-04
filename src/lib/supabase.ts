import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Browser-safe Supabase client using public anon key.
 * Never exposes service role key to client-side code.
 */
let supabaseClientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const supabaseUrl =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL);

  const supabaseAnonKey =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY);

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes('PASTE_') ||
    supabaseAnonKey.includes('PASTE_')
  ) {
    return null;
  }

  if (!supabaseClientInstance) {
    supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseClientInstance;
}

/**
 * Server-only Supabase client for privileged administrative tasks.
 * ONLY callable in Node.js server environments.
 */
export function getServerSupabaseClient(): SupabaseClient | null {
  if (typeof window !== 'undefined') {
    throw new Error('getServerSupabaseClient must NEVER be called in browser environments.');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !supabaseUrl ||
    !serviceRoleKey ||
    supabaseUrl.includes('PASTE_') ||
    serviceRoleKey.includes('PASTE_')
  ) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey);
}
