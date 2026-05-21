'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

export const usePageNavigation = (totalPages: number) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentPageRef = useRef(0);
  const isTransitioningRef = useRef(false);

  const goToPage = useCallback(
    (pageIndex: number) => {
      if (pageIndex >= 0 && pageIndex < totalPages && !isTransitioningRef.current) {
        isTransitioningRef.current = true;
        setIsTransitioning(true);
        currentPageRef.current = pageIndex;
        setCurrentPage(pageIndex);
        setTimeout(() => {
          isTransitioningRef.current = false;
          setIsTransitioning(false);
        }, 800);
      }
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    goToPage(currentPageRef.current + 1);
  }, [goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPageRef.current - 1);
  }, [goToPage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToPage(currentPageRef.current + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPage(currentPageRef.current - 1);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) {
        return;
      }

      const eventTarget = e.target;
      const targetElement = eventTarget instanceof Element ? eventTarget : null;
      const scrollContainer = targetElement?.closest('[data-section-scroll="true"]') as HTMLElement | null;

      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        const maxScrollTop = Math.max(0, scrollHeight - clientHeight);
        const atTop = scrollTop <= 0;
        const atBottom = scrollTop >= maxScrollTop - 1;
        const scrollingDown = e.deltaY > 0;
        const scrollingUp = e.deltaY < 0;

        if ((scrollingDown && !atBottom) || (scrollingUp && !atTop)) {
          return;
        }
      }

      e.preventDefault();
      if (e.deltaY > 0) {
        goToPage(currentPageRef.current + 1);
      } else if (e.deltaY < 0) {
        goToPage(currentPageRef.current - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [goToPage]);

  return {
    currentPage,
    isTransitioning,
    goToPage,
    nextPage,
    prevPage,
    canGoNext: currentPage < totalPages - 1,
    canGoPrev: currentPage > 0,
  };
};
