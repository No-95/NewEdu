'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type PageAIInfo = {
  pageType: 'course-detail' | 'course-video' | 'other';
  courseTitle?: string;
  courseDescription?: string;
  lectureTitle?: string;
  lectureDescription?: string;
  videoId?: string;
};

type PageAIContextValue = {
  info: PageAIInfo | null;
  setInfo: (info: PageAIInfo | null) => void;
  clearInfo: () => void;
};

const PageAIContext = createContext<PageAIContextValue>({
  info: null,
  setInfo: () => {},
  clearInfo: () => {},
});

export function PageAIProvider({ children }: { children: ReactNode }) {
  const [info, setInfoState] = useState<PageAIInfo | null>(null);

  const setInfo = useCallback((next: PageAIInfo | null) => {
    setInfoState(next);
  }, []);

  const clearInfo = useCallback(() => {
    setInfoState(null);
  }, []);

  return (
    <PageAIContext.Provider value={{ info, setInfo, clearInfo }}>
      {children}
    </PageAIContext.Provider>
  );
}

export function usePageAI() {
  return useContext(PageAIContext);
}

export function buildPageContextSummary(info: PageAIInfo): string {
  const parts: string[] = [];

  if (info.courseTitle) {
    parts.push(`Course: "${info.courseTitle}"`);
  }

  if (info.courseDescription) {
    parts.push(`Course description: ${info.courseDescription}`);
  }

  if (info.pageType === 'course-video') {
    if (info.lectureTitle) {
      parts.push(`Current video: "${info.lectureTitle}"`);
    }
    if (info.lectureDescription) {
      parts.push(`Video description: ${info.lectureDescription}`);
    }
    if (info.videoId) {
      parts.push(`Video ID: ${info.videoId}`);
    }
  }

  return parts.join('\n');
}
