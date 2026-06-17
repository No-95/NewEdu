'use client';

import { useEffect, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { getAllLocalProgressEntries } from '@/hooks/useCourseProgress';

export function useMigrateLocalProgress(
  email: string | null,
  totalLecturesBySlug: Record<string, number>
) {
  const migrate = useMutation(api.progress.migrateLocalProgressBatch);
  const migratedRef = useRef(false);

  useEffect(() => {
    if (!email || migratedRef.current) return;
    if (Object.keys(totalLecturesBySlug).length === 0) return;

    const entries = getAllLocalProgressEntries();
    if (entries.length === 0) return;

    migratedRef.current = true;
    const items = entries.map((entry) => ({
      courseSlug: entry.courseSlug,
      completedLectures: entry.completed.length,
      totalLectures: totalLecturesBySlug[entry.courseSlug] ?? entry.completed.length,
      lastVideoId: entry.lastVideoId ?? entry.completed[entry.completed.length - 1],
    }));

    void migrate({ email, items });
  }, [email, migrate, totalLecturesBySlug]);
}
