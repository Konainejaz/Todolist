"use client";

import { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabaseBrowser';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState('Completing sign-in…');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const supabase = getSupabaseBrowser();
        if (!supabase) {
          setStatus('Google sign-in is not configured.');
          return;
        }

        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        if (!code) {
          setStatus('Missing OAuth code.');
          return;
        }

        const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) throw exchangeError;

        const accessToken = exchangeData?.session?.access_token;
        if (!accessToken) {
          setStatus('Missing access token.');
          return;
        }

        const res = await fetch('/api/auth/oauth/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: accessToken }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || 'OAuth completion failed');
        }

        await supabase.auth.signOut();

        if (!cancelled) {
          window.location.replace('/');
        }
      } catch (e) {
        if (!cancelled) {
          setStatus(e?.message || 'Sign-in failed');
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-6">
      <div className="glass rounded-2xl p-8 max-w-md w-full border border-white/10 text-center">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Signing you in</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">{status}</p>
      </div>
    </div>
  );
}

