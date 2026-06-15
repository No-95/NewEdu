'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
import { ClientOnly } from '@/lib/hooks/useClientOnly';

interface AppPageShellProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: '6xl' | '7xl';
}

function ShellContent({ title, subtitle, actions, children, maxWidth = '7xl' }: AppPageShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      <Header />
      <main
        className={`relative z-10 mx-auto px-4 pb-16 pt-24 sm:px-6 ${maxWidth === '6xl' ? 'max-w-6xl' : 'max-w-7xl'}`}
      >
        <header className="mb-8 animate-slide-up">
          <div className="home-grid-bg rounded-2xl border border-white/10 bg-card/30 p-6 backdrop-blur-sm md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="home-eyebrow mb-3">HDP EDU</p>
                <h1 className="home-title text-3xl md:text-4xl">{title}</h1>
                {subtitle && <p className="home-subtitle mt-3 max-w-2xl">{subtitle}</p>}
              </div>
              {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

export function AppPageShell(props: AppPageShellProps) {
  return (
    <ClientOnly>
      <ShellContent {...props} />
    </ClientOnly>
  );
}
