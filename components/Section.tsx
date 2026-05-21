'use client';

import React, { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  showPageIndicator?: boolean;
  pageNumber?: number;
  totalPages?: number;
}

export const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  id,
  showPageIndicator = false,
  pageNumber = 0,
  totalPages = 0,
}) => {
  return (
    <section
      id={id}
      className={`relative w-screen h-screen flex items-center justify-center overflow-hidden flex-shrink-0 pointer-events-auto ${className}`}
    >
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 20% 50%, rgba(0, 217, 255, 0.1) 0%, transparent 50%)',
        }} />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 80% 80%, rgba(0, 102, 255, 0.1) 0%, transparent 50%)',
        }} />
      </div>

      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {children}
      </div>

      {showPageIndicator && totalPages > 0 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === pageNumber
                  ? 'w-8 bg-primary glow-cyan'
                  : 'w-2 bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
