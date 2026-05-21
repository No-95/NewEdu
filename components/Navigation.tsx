'use client';

import React from 'react';

interface NavigationProps {
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  currentPage: number;
  totalPages: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  currentPage,
  totalPages,
}) => {
  return (
    <div className="fixed bottom-8 right-8 z-30 flex gap-4">
      <button
        onClick={onPrev}
        disabled={!canGoPrev}
        className={`group relative inline-flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
          canGoPrev
            ? 'bg-secondary hover:shadow-glow-blue cursor-pointer'
            : 'bg-muted opacity-50 cursor-not-allowed'
        }`}
        aria-label="Previous page"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={onNext}
        disabled={!canGoNext}
        className={`group relative inline-flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
          canGoNext
            ? 'bg-primary hover:shadow-glow-cyan cursor-pointer'
            : 'bg-muted opacity-50 cursor-not-allowed'
        }`}
        aria-label="Next page"
      >
        <svg className="w-5 h-5 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};
