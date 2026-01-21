import { createClient } from '@supabase/supabase-js';

let cachedBrowser = null;

export function getSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (cachedBrowser) return cachedBrowser;
  cachedBrowser = createClient(url, key);
  return cachedBrowser;
}

