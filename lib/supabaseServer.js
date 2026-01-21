import { createClient } from '@supabase/supabase-js';

let cachedAdmin = null;

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Supabase is not configured');
    }
    return null;
  }
  if (cachedAdmin) return cachedAdmin;
  cachedAdmin = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return cachedAdmin;
}
