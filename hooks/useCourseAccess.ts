'use client';

import { useCallback, useEffect, useState } from 'react';

type CourseAccessState = {
  loading: boolean;
  syncingPayment: boolean;
  user: { _id?: string; email?: string } | null;
  hasAccess: boolean;
  refreshAccess: () => Promise<boolean>;
};

async function fetchHasAccess(courseSlug: string): Promise<boolean> {
  const accessRes = await fetch(
    `/api/purchase/has-access?courseId=${encodeURIComponent(courseSlug)}`,
    { cache: 'no-store' }
  );
  if (!accessRes.ok) return false;
  const json = await accessRes.json();
  return !!json.hasAccess;
}

async function confirmPayosReturn(courseSlug: string): Promise<boolean> {
  const res = await fetch('/api/purchase/confirm-payos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseId: courseSlug }),
  });
  if (!res.ok) return false;
  const json = await res.json();
  return !!json.hasAccess;
}

export function useCourseAccess(
  courseSlug: string,
  isFree: boolean,
  options?: { syncAfterPayment?: boolean }
): CourseAccessState {
  const syncAfterPayment = options?.syncAfterPayment ?? false;
  const [loading, setLoading] = useState(true);
  const [syncingPayment, setSyncingPayment] = useState(false);
  const [user, setUser] = useState<{ _id?: string; email?: string } | null>(null);
  const [hasAccess, setHasAccess] = useState(isFree);

  const refreshAccess = useCallback(async () => {
    const access = await fetchHasAccess(courseSlug);
    setHasAccess(access);
    return access;
  }, [courseSlug]);

  useEffect(() => {
    if (isFree) {
      setHasAccess(true);
      setLoading(false);
      return;
    }

    let mounted = true;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/profile/me', { cache: 'no-store' });
        if (!res.ok) {
          if (mounted) {
            setUser(null);
            setHasAccess(false);
          }
          return;
        }

        const data = await res.json();
        if (!mounted) return;
        setUser(data);

        if (!data) {
          setHasAccess(false);
          return;
        }

        let access = await fetchHasAccess(courseSlug);
        if (!mounted) return;
        setHasAccess(access);

        if (!access) {
          await confirmPayosReturn(courseSlug);
          if (!mounted) return;
          access = await fetchHasAccess(courseSlug);
          setHasAccess(access);
        }

        if (syncAfterPayment && !access) {
          setSyncingPayment(true);
          await confirmPayosReturn(courseSlug);
          if (!mounted) return;
          access = await fetchHasAccess(courseSlug);
          setHasAccess(access);

          if (!access && mounted) {
            let attempts = 0;
            pollTimer = setInterval(() => {
              attempts += 1;
              void (async () => {
                await confirmPayosReturn(courseSlug);
                const next = await fetchHasAccess(courseSlug);
                if (!mounted) return;
                setHasAccess(next);
                if (next || attempts >= 15) {
                  if (pollTimer) clearInterval(pollTimer);
                  setSyncingPayment(false);
                }
              })();
            }, 2000);
          } else if (mounted) {
            setSyncingPayment(false);
          }
        }
      } catch {
        if (mounted) setHasAccess(false);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [courseSlug, isFree, syncAfterPayment]);

  return { loading, syncingPayment, user, hasAccess, refreshAccess };
}
