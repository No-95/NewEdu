'use client';

import React from 'react';
import Link from 'next/link';
import { Section } from '@/components/Section';
import { HomeCard } from '@/components/sections/home/HomeCard';
import { useLanguage } from '@/lib/context/LanguageContext';

interface CTASectionProps {
  pageNumber: number;
  totalPages: number;
}

export const CTASection: React.FC<CTASectionProps> = ({ pageNumber, totalPages }) => {
  const { t } = useLanguage();
  const flowParts = t('home.cta.connectionFlow')
    .split('⇄')
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <Section
      id="cta"
      pageNumber={pageNumber}
      totalPages={totalPages}
      showPageIndicator={true}
      className="relative"
    >
      <div className="absolute inset-0 z-10 flex items-center px-6 py-20 md:px-10">
        <div className="mx-auto w-full max-w-5xl animate-slide-up">
          <HomeCard variant="feature" className="relative overflow-hidden">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-secondary/10 blur-3xl" />

            <div className="relative space-y-8">
              <div className="text-center">
                <span className="home-eyebrow mb-4 justify-center">HDP EDU</span>
                <p className="text-sm text-muted-foreground">{t('home.cta.connectionLabel')}</p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  {flowParts.map((node, index) => (
                    <HomeCard key={`${node}-${index}`} variant="chip" className="!inline-flex !px-3 !py-1.5">
                      {node}
                    </HomeCard>
                  ))}
                </div>
              </div>

              <h2 className="home-title text-center text-primary">{t('home.cta.headline')}</h2>

              <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
                <HomeCard variant="muted">
                  <p className="home-subtitle !text-sm md:!text-base">{t('home.cta.description1')}</p>
                </HomeCard>
                <HomeCard variant="muted">
                  <p className="home-subtitle !text-sm md:!text-base">{t('home.cta.description2')}</p>
                </HomeCard>
              </div>

              <HomeCard variant="default" className="mx-auto max-w-3xl text-center">
                <p className="text-base font-bold tracking-wide text-primary md:text-lg">
                  {t('home.cta.ecosystemBadge')}
                </p>
                <p className="home-subtitle mt-2 text-sm md:text-base">{t('home.cta.ecosystemTagline')}</p>
              </HomeCard>

              <div className="flex flex-col items-center gap-4">
                <Link href="/auth" className="home-btn-primary px-10 py-3.5 text-base">
                  {t('home.cta.signUpFree')}
                </Link>
                <p className="text-xs text-muted-foreground">{t('home.cta.copyright')}</p>
              </div>
            </div>
          </HomeCard>
        </div>
      </div>
    </Section>
  );
};
