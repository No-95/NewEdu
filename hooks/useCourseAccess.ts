'use client';

import { useEffect, useState } from 'react';

type CourseAccessState = {
  loading: boolean;
  user: { _id?: string; email?: string } | null;
  hasAccess: boolean;
};

export function useCourseAccess(courseSlug: string, isFree: boolean): CourseAccessState {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ _id?: string; email?: string } | null>(null);
  const [hasAccess, setHasAccess] = useState(isFree);

  useEffect(() => {
    if (isFree) {
      setHasAccess(true);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    void (async () => {
      try {
        const res = await fetch('/api/profile/me', { cache: 'no-store' });
        if (!res.ok) {
          if (mounted) {
            setUser(null);
            setHasAccess(false);
            setLoading(false);
          }
          return;
        }

        const data = await res.json();
        if (!mounted) return;
        setUser(data);

        if (!data) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        const accessRes = await fetch(
          `/api/purchase/has-access?courseId=${encodeURIComponent(courseSlug)}`,
          { cache: 'no-store' }
        );
        if (accessRes.ok) {
          const json = await accessRes.json();
          if (mounted) setHasAccess(!!json.hasAccess);
        } else if (mounted) {
          setHasAccess(false);
        }
      } catch {
        if (mounted) setHasAccess(false);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [courseSlug, isFree]);

  return { loading, user, hasAccess };
}
