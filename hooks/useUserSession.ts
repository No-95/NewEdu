'use client';

import { useEffect, useState } from 'react';

export function useUserEmail() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void fetch('/api/auth/me', { credentials: 'same-origin', cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted) setEmail(data?.email ?? null);
      })
      .catch(() => {
        if (mounted) setEmail(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return email;
}

export function useUserSession() {
  const [session, setSession] = useState<{ email: string; roles: string[] } | null>(null);

  useEffect(() => {
    let mounted = true;
    void fetch('/api/auth/me', { credentials: 'same-origin', cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted || !data?.email) return;
        setSession({
          email: data.email,
          roles: Array.isArray(data.roles) ? data.roles : [],
        });
      })
      .catch(() => {
        if (mounted) setSession(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return session;
}
