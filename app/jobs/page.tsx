'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
import { useLanguage } from '@/lib/context/LanguageContext';
import { ClientOnly } from '@/lib/hooks/useClientOnly';

function JobsContent() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      <Header />

      <main className="relative z-10 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header Section */}
          <div className="mb-12 animate-slide-up text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t('jobs.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('jobs.description')}
            </p>
          </div>

          {/* Single Job Card */}
          <div className="animate-fade-in flex justify-center">
            <div className="glass rounded-xl p-6 border border-border/50 w-full max-w-5xl text-center">
              <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                  {t('jobs.remoteJobTag')}
                </span>
                <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                  {t('jobs.flexibleWorkingHourTag')}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-2">{t('jobs.featuredTitle')}</h2>
              <p className="text-muted-foreground mb-4">{t('jobs.featuredDescription')}</p>

              <div className="grid sm:grid-cols-2 gap-3 mb-5 max-w-2xl mx-auto">
                <div className="rounded-lg bg-muted/40 border border-border/50 px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-1">{t('jobs.teacherProfitShare')}</p>
                  <p className="text-lg font-bold text-emerald-400">92%</p>
                </div>
                <div className="rounded-lg bg-muted/40 border border-border/50 px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-1">{t('jobs.platformShare')}</p>
                  <p className="text-lg font-bold text-primary">8%</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/teacher-applicant"
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:shadow-glow-cyan transition-all text-sm font-medium"
                >
                  {t('common.applyNow')}
                </Link>
                <Link
                  href="/jobs/start-teaching-now"
                  className="px-6 py-2.5 bg-muted text-foreground rounded-lg border border-border/60 hover:bg-muted/80 transition-all text-sm font-medium"
                >
                  {t('common.learnMore')}
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center animate-fade-in">
            <p className="text-muted-foreground text-sm sm:text-base">
              {t('jobs.moreJobsSoon')}
            </p>
            <Link
              href="/contact-us"
              className="inline-flex mt-4 px-6 py-2.5 bg-muted text-foreground rounded-lg border border-border/60 hover:bg-muted/80 transition-all text-sm font-medium"
            >
              {t('common.contactUs')}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function JobsPage() {
  return (
    <ClientOnly>
      <JobsContent />
    </ClientOnly>
  );
}
