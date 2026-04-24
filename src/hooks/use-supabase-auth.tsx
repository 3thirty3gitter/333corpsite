"use client";
import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // subscription object from onAuthStateChange
    let subscription: { unsubscribe?: () => void } | null = null;

    // fetch the current session asynchronously but keep the subscription synchronous
    (async () => {
      try {
        if (!supabaseClient) {
          if (mounted) setLoading(false);
          return;
        }
        const { data } = await supabaseClient.auth.getSession();
        const currentSession = data?.session ?? null;

        if (!mounted) return;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      } catch (err) {
        if (mounted) setLoading(false);
      }
    })();

    if (supabaseClient) {
      const res = supabaseClient.auth.onAuthStateChange((event, session) => {
        if (!mounted) return;
        setSession(session ?? null);
        setUser(session?.user ?? null);
      });

      subscription = res?.data?.subscription ?? null;
    }

    return () => {
      mounted = false;
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return { user, session, loading };
}
