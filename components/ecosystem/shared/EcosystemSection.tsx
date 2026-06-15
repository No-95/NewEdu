'use client';

import React from 'react';

export function EcosystemSection({
  title,
  children,
  actions,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`mb-8 animate-fade-in ${className}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground md:text-xl">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}
