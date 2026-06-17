'use client';

import { useEffect, useState } from 'react';

const PROGRESS_KEY_PREFIX = 'hdpedu-course-progress:';

export interface CourseProgressState {
  completed: string[];
  lastVideoId?: string;
}

function getProgressKey(courseId: string): string {
  return `${PROGRESS_KEY_PREFIX}${courseId}`;
}

export function readProgress(courseSlug: string): CourseProgressState {
  if (typeof window === 'undefined') {
    return { completed: [] };
  }

  try {
    const raw = window.localStorage.getItem(getProgressKey(courseSlug));
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
      lastVideoId: typeof parsed.lastVideoId === 'string' ? parsed.lastVideoId : undefined,
    };
  } catch {
    return { completed: [] };
  }
}

function writeProgress(courseSlug: string, state: CourseProgressState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(getProgressKey(courseSlug), JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: { courseId: courseSlug } }));
}

const PROGRESS_EVENT = 'hdpedu-course-progress-change';

export function markLectureCompleted(courseSlug: string, videoId: string) {
  const state = readProgress(courseSlug);
  if (!state.completed.includes(videoId)) {
    writeProgress(courseSlug, {
      ...state,
      completed: [...state.completed, videoId],
      lastVideoId: videoId,
    });
  }
}

export function markLastWatched(courseSlug: string, videoId: string) {
  const state = readProgress(courseSlug);
  if (state.lastVideoId === videoId) return;
  writeProgress(courseSlug, { ...state, lastVideoId: videoId });
}

export function getAllLocalProgressEntries(): Array<{
  courseSlug: string;
  completed: string[];
  lastVideoId?: string;
}> {
  if (typeof window === 'undefined') return [];

  const entries: Array<{ courseSlug: string; completed: string[]; lastVideoId?: string }> = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key?.startsWith(PROGRESS_KEY_PREFIX)) continue;
    const courseSlug = key.slice(PROGRESS_KEY_PREFIX.length);
    const state = readProgress(courseSlug);
    entries.push({ courseSlug, completed: state.completed, lastVideoId: state.lastVideoId });
  }
  return entries;
}

export function useCourseProgress(courseSlug: string) {
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    setCompleted(readProgress(courseSlug).completed);
  }, [courseSlug]);

  useEffect(() => {
    const handleProgressChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ courseId?: string }>;
      if (customEvent.detail?.courseId && customEvent.detail.courseId !== courseSlug) {
        return;
      }

      setCompleted(readProgress(courseSlug).completed);
    };

    window.addEventListener(PROGRESS_EVENT, handleProgressChange as EventListener);
    window.addEventListener('storage', handleProgressChange);

    return () => {
      window.removeEventListener(PROGRESS_EVENT, handleProgressChange as EventListener);
      window.removeEventListener('storage', handleProgressChange);
    };
  }, [courseSlug]);

  return {
    completed,
    isCompleted: (videoId: string) => completed.includes(videoId),
    completedCount: completed.length,
    markLectureCompleted: (videoId: string) => markLectureCompleted(courseSlug, videoId),
  };
}
