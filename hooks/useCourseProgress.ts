'use client';

import { useEffect, useMemo, useState } from 'react';

const PROGRESS_EVENT = 'hdpedu-course-progress-change';

interface CourseProgressState {
  completed: string[];
}

function getProgressKey(courseId: string): string {
  return `hdpedu-course-progress:${courseId}`;
}

function readProgress(courseId: string): CourseProgressState {
  if (typeof window === 'undefined') {
    return { completed: [] };
  }

  try {
    const raw = window.localStorage.getItem(getProgressKey(courseId));
    if (!raw) {
      return { completed: [] };
    }

    const parsed = JSON.parse(raw) as Partial<CourseProgressState> | string[];
    if (Array.isArray(parsed)) {
      return { completed: parsed.filter((item): item is string => typeof item === 'string') };
    }

    return {
      completed: Array.isArray(parsed.completed)
        ? parsed.completed.filter((item): item is string => typeof item === 'string')
        : [],
    };
  } catch {
    return { completed: [] };
  }
}

function writeProgress(courseId: string, state: CourseProgressState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(getProgressKey(courseId), JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: { courseId } }));
}

export function markLectureCompleted(courseId: string, videoId: string) {
  const state = readProgress(courseId);
  if (!state.completed.includes(videoId)) {
    writeProgress(courseId, {
      completed: [...state.completed, videoId],
    });
  }
}

export function useCourseProgress(courseId: string) {
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    setCompleted(readProgress(courseId).completed);
  }, [courseId]);

  useEffect(() => {
    const handleProgressChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ courseId?: string }>;
      if (customEvent.detail?.courseId && customEvent.detail.courseId !== courseId) {
        return;
      }

      setCompleted(readProgress(courseId).completed);
    };

    window.addEventListener(PROGRESS_EVENT, handleProgressChange as EventListener);
    window.addEventListener('storage', handleProgressChange);

    return () => {
      window.removeEventListener(PROGRESS_EVENT, handleProgressChange as EventListener);
      window.removeEventListener('storage', handleProgressChange);
    };
  }, [courseId]);

  return useMemo(
    () => ({
      completed,
      isCompleted: (videoId: string) => completed.includes(videoId),
      completedCount: completed.length,
      markLectureCompleted: (videoId: string) => markLectureCompleted(courseId, videoId),
    }),
    [completed, courseId]
  );
}
