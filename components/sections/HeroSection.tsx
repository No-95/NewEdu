'use client';

import React from 'react';
import Link from 'next/link';
import { Section } from '@/components/Section';
import { ImageCube } from '@/components/ImageCube';
import { HomeCard } from '@/components/sections/home/HomeCard';
import { useLanguage } from '@/lib/context/LanguageContext';

interface HeroSectionProps {
  pageNumber: number;
  totalPages: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ pageNumber, totalPages }) => {
  const { t } = useLanguage();
  const heroImages = [
    '/homepage/hero1.png',
    '/homepage/hero2.png',
    '/homepage/hero3.png',
    '/homepage/hero4.png',
  ];

  const metrics = [
    { value: '50.000+', label: t('home.trust.communityMembers') },
    { value: '10.000+', label: t('home.trust.learnersWorkers') },
    { value: '500+', label: t('home.trust.teachersExperts') },
    { value: '1.000+', label: t('home.trust.partnerBusinesses') },
    { value: '10.000+', label: t('home.trust.jobOpportunities') },
    { value: '100.000+', label: t('home.trust.learningResources') },
  ];

  return (
    <Section
      id="hero"
      pageNumber={pageNumber}
      totalPages={totalPages}
      showPageIndicator={true}
      className="relative pt-20"
    >
      <div className="relative z-10 w-full max-w-6xl px-6 h-full flex flex-col">
        <div className="hero-bg-circle absolute top-1/4 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="hero-bg-circle absolute bottom-1/4 right-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex min-h-0 flex-1 items-center overflow-y-auto">
          <div className="grid w-full lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up flex flex-col items-start text-left w-full space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-none tracking-tight whitespace-nowrap">
              {t('home.hero.badge')}
            </h1>

            <div className="w-fit">
              <p className="text-sm font-medium text-muted-foreground whitespace-nowrap sm:text-base md:text-lg lg:text-xl">
                {t('home.hero.tagline')}
              </p>

              <HomeCard
                variant="default"
                className="mt-4 box-border w-full space-y-4 !p-5 md:!p-6"
              >
                <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                  {t('home.hero.description1')}
                </p>
                <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                  {t('home.hero.description2')}
                </p>
              </HomeCard>
            </div>

            <div className="relative z-20 flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth"
                className="px-8 py-3.5 bg-primary text-primary-foreground text-base font-semibold rounded-lg hover:shadow-glow-cyan transition-all duration-300"
              >
                {t('home.hero.startNow')}
              </Link>
              <Link
                href="/auth"
                className="px-8 py-3.5 border border-border text-foreground text-base font-semibold rounded-lg hover:bg-muted/50 transition-all duration-300"
              >
                {t('home.hero.exploreEcosystem')}
              </Link>
            </div>
          </div>

          <div className="flex justify-center items-center animate-slide-in-right">
            <div className="relative">
              <div className="hero-cube-float absolute -top-8 -left-8 w-16 h-16 glass rounded-xl flex items-center justify-center animate-float">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="hero-cube-float absolute -bottom-6 -right-6 w-14 h-14 glass rounded-xl flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
                <svg className="w-7 h-7 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="hero-cube-float absolute top-1/2 -right-12 w-12 h-12 glass rounded-xl flex items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>

              <ImageCube size={300} images={heroImages} />
            </div>
          </div>
          </div>
        </div>

        <div className="relative z-10 mt-2 w-full shrink-0 border-t border-border/40 pt-3 pb-16">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {metrics.map((metric, index) => (
              <HomeCard key={index} variant="stat" className="!px-2 !py-2 md:!px-3 md:!py-2.5">
                <div className="text-base font-bold leading-none text-primary md:text-lg">{metric.value}</div>
                <p className="mt-0.5 text-[9px] leading-tight text-muted-foreground md:text-[10px]">
                  {metric.label}
                </p>
              </HomeCard>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};
