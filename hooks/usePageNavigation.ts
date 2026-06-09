'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

const SECTION_IDS = ['hero', 'ecosystem', 'why-choose', 'connection', 'cta'] as const;
const PANEL_SCROLL_LOCK_MS = 750;

const getScrollContainerForPage = (pageIndex: number): HTMLElement | null => {
  const sectionId = SECTION_IDS[pageIndex];
  if (!sectionId) return null;
  return document.getElementById(sectionId)?.querySelector('[data-section-scroll="true"]') as HTMLElement | null;
};

const getActivePanelIndex = (container: HTMLElement, panels: HTMLElement[]): number => {
  const scrollTop = container.scrollTop;
  let activeIndex = 0;

  for (let i = 0; i < panels.length; i++) {
    const panelTop = panels[i].offsetTop;
    if (scrollTop >= panelTop - container.clientHeight * 0.35) {
      activeIndex = i;
    }
  }

  return activeIndex;
};

export const usePageNavigation = (totalPages: number) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentPageRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const panelScrollLockRef = useRef(false);

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
    const isEditableElement = (element: EventTarget | Element | null) => {
      if (!(element instanceof Element)) {
        return false;
      }

      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        return true;
      }

      if ((element as HTMLElement).isContentEditable) {
        return true;
      }

      return Boolean(element.closest('input, textarea, [contenteditable="true"], [role="textbox"]'));
    };

    const scrollToPanel = (container: HTMLElement, panel: HTMLElement) => {
      panelScrollLockRef.current = true;
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => {
        panelScrollLockRef.current = false;
      }, PANEL_SCROLL_LOCK_MS);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;

      if (isEditableElement(e.target) || isEditableElement(activeElement)) {
        return;
      }

      const isSpace = e.key === ' ' || e.code === 'Space';

      if (e.key === 'ArrowRight' || isSpace) {
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

      if (panelScrollLockRef.current) {
        e.preventDefault();
        return;
      }

      const eventTarget = e.target;
      const targetElement = eventTarget instanceof Element ? eventTarget : null;

      let scrollContainer =
        (targetElement?.closest('[data-section-scroll="true"]') as HTMLElement | null) ??
        getScrollContainerForPage(currentPageRef.current);

      if (scrollContainer) {
        const scrollMode = scrollContainer.getAttribute('data-section-scroll-mode');
        const scrollingDown = e.deltaY > 0;
        const scrollingUp = e.deltaY < 0;

        if (scrollMode === 'carousel') {
          e.preventDefault();

          const atStart = scrollContainer.getAttribute('data-carousel-at-start') === 'true';
          const atEnd = scrollContainer.getAttribute('data-carousel-at-end') === 'true';

          if (scrollingUp && atStart) {
            goToPage(currentPageRef.current - 1);
            return;
          }

          if (scrollingDown && atEnd) {
            goToPage(currentPageRef.current + 1);
            return;
          }

          scrollContainer.dispatchEvent(
            new CustomEvent('section-carousel-step', {
              detail: { direction: scrollingDown ? 'down' : 'up' },
            })
          );
          return;
        }

        if (scrollMode === 'panel') {
          e.preventDefault();

          const panels = Array.from(
            scrollContainer.querySelectorAll('[data-scroll-panel]')
          ) as HTMLElement[];

          if (panels.length === 0) {
            return;
          }

          const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
          const maxScrollTop = Math.max(0, scrollHeight - clientHeight);
          const atTop = scrollTop <= 2;
          const atBottom = scrollTop >= maxScrollTop - 2;
          const activeIndex = getActivePanelIndex(scrollContainer, panels);

          if (scrollingUp && activeIndex === 0 && atTop) {
            goToPage(currentPageRef.current - 1);
            return;
          }

          if (scrollingDown && activeIndex === panels.length - 1 && atBottom) {
            goToPage(currentPageRef.current + 1);
            return;
          }

          const targetIndex = scrollingDown
            ? Math.min(activeIndex + 1, panels.length - 1)
            : Math.max(activeIndex - 1, 0);

          if (targetIndex !== activeIndex) {
            scrollToPanel(scrollContainer, panels[targetIndex]);
          }

          return;
        }

        const atTop = scrollContainer.scrollTop <= 0;
        const atBottom =
          scrollContainer.scrollTop >= scrollContainer.scrollHeight - scrollContainer.clientHeight - 1;

        if ((scrollingDown && !atBottom) || (scrollingUp && !atTop)) {
          e.preventDefault();
          scrollContainer.scrollBy({ top: e.deltaY, behavior: 'smooth' });
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
