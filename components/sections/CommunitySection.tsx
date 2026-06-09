'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Section } from '@/components/Section';
import { HomeBulletList, HomeCard } from '@/components/sections/home/HomeCard';
import { useLanguage } from '@/lib/context/LanguageContext';

interface CommunitySectionProps {
  pageNumber: number;
  totalPages: number;
}

export const CommunitySection: React.FC<CommunitySectionProps> = ({ pageNumber, totalPages }) => {
  const { t } = useLanguage();
  const bullets = t('home.community.bullets', { returnObjects: true }) as string[];
  const bulletItems = Array.isArray(bullets) ? bullets : [];

  return (
    <Section
      id="community"
      pageNumber={pageNumber}
      totalPages={totalPages}
      showPageIndicator={true}
      className="relative"
    >
      <div className="absolute inset-0 z-10 flex items-center px-6 py-20 md:px-10">
        <div className="mx-auto grid w-full max-w-6xl animate-slide-up items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="space-y-6">
            <HomeCard variant="feature">
              <span className="home-eyebrow">HDP EDU</span>
              <h2 className="home-title mt-4">{t('home.community.title')}</h2>
              <p className="home-subtitle mt-3">{t('home.community.subtitle')}</p>

              <HomeCard variant="muted" className="mt-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/90">
                  {t('home.community.canDo')}
                </p>
                <HomeBulletList items={bulletItems} inCards />
              </HomeCard>

              <Link href="/community" className="home-btn-primary mt-6 inline-flex">
                {t('home.community.cta')}
              </Link>
            </HomeCard>
          </div>

          <div className="relative">
            <HomeCard variant="default" className="relative aspect-[5/4] w-full overflow-hidden !p-0">
              <Image
                src="/homepage/section6.png"
                alt={t('home.community.title')}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-background/50 via-transparent to-primary/10" />
            </HomeCard>
            <HomeCard variant="muted" className="absolute -bottom-5 left-6 right-6 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/90">
                Vietnam — Korea
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{t('home.community.cta')}</p>
            </HomeCard>
          </div>
        </div>
      </div>
    </Section>
  );
};
