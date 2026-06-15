'use client';

import React from 'react';
import Link from 'next/link';
import { Section } from '@/components/Section';
import { useLanguage } from '@/lib/context/LanguageContext';

interface HomeClosingSectionProps {
  pageNumber: number;
  totalPages: number;
  panelIndex: 0 | 1 | 2;
  sectionId: 'why-choose' | 'connection' | 'cta';
}

const FEATURE_ICONS = ['🎓', '💼', '🏢', '🤝', '🌏', '📚'];

const SECTION_IMAGES = [
  '/homepage/section3.png',
  '/homepage/section4.png',
  '/homepage/CTAsection.png',
];

const TITLE_KEYS = ['home.whyChoose.title', 'home.cta.headline', 'home.cta.ecosystemBadge'] as const;

export const HomeClosingSection: React.FC<HomeClosingSectionProps> = ({
  pageNumber,
  totalPages,
  panelIndex,
  sectionId,
}) => {
  const { t } = useLanguage();

  const pillars = t('home.whyChoose.pillars', { returnObjects: true });
  const pillarItems = Array.isArray(pillars) ? pillars : [];

  const connectNodes = t('home.cta.connectionFlow')
    .split('⇄')
    .map((part) => part.trim())
    .filter(Boolean);

  const ecosystemPills = t('home.cta.ecosystemPills', { returnObjects: true });
  const pillItems = Array.isArray(ecosystemPills) ? ecosystemPills : [];

  return (
    <Section
      id={sectionId}
      pageNumber={pageNumber}
      totalPages={totalPages}
      showPageIndicator={true}
      fillHeight
      className="relative !items-stretch !justify-stretch"
    >
      <div className="relative flex h-full w-full flex-col pt-16 pb-10">
        <div className="flex min-h-[16vh] shrink-0 flex-col items-center justify-center border-b border-primary/15 bg-gradient-to-b from-primary/5 to-transparent px-6 py-4 md:px-8">
          <span className="animate-slide-up text-center text-2xl font-extrabold uppercase tracking-wide text-primary md:text-3xl lg:text-4xl xl:text-5xl">
            {t(TITLE_KEYS[panelIndex])}
          </span>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden">
          {panelIndex === 0 && (
            <div className="absolute inset-0 flex animate-slide-up flex-col lg:flex-row">
              <div className="flex flex-1 flex-col justify-center px-8 py-8 md:px-12 lg:px-16 lg:py-10">
                <div className="mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-7">
                  <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/80">
                    {t('home.whyChoose.subtitle')}
                  </p>
                  <blockquote className="border-l-[3px] border-primary pl-5 text-base italic leading-relaxed text-foreground/90 md:text-lg">
                    &ldquo;{t('home.whyChoose.leadQuote')}&rdquo;
                  </blockquote>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {pillarItems.map((label, index) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3.5 transition-colors hover:border-primary/50 hover:bg-primary/10"
                    >
                      <span className="text-xl">{FEATURE_ICONS[index] ?? '✓'}</span>
                      <span className="text-sm font-medium text-foreground/90">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative flex flex-[0_0_42%] items-center justify-center p-6 lg:p-10 lg:pl-0">
                <div className="relative h-[220px] w-full overflow-hidden rounded-2xl border border-primary/25 shadow-[0_0_40px_rgba(0,217,255,0.12)] lg:h-full lg:min-h-[280px]">
                  <img
                    src={SECTION_IMAGES[0]}
                    alt={t('home.whyChoose.title')}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          {panelIndex === 1 && (
            <div className="absolute inset-0 flex animate-slide-up flex-col lg:flex-row">
              <div className="relative order-2 flex flex-[0_0_42%] items-center justify-center p-6 lg:order-1 lg:p-10 lg:pr-0">
                <div className="relative h-[220px] w-full overflow-hidden rounded-2xl border border-primary/25 shadow-[0_0_40px_rgba(0,217,255,0.12)] lg:h-full lg:min-h-[280px]">
                  <img
                    src={SECTION_IMAGES[1]}
                    alt={t('home.cta.headline')}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="order-1 flex flex-1 flex-col justify-center px-8 py-8 md:px-12 lg:order-2 lg:px-16 lg:py-10">
                <blockquote className="mb-6 border-l-[3px] border-primary pl-5 text-base italic leading-relaxed text-foreground/85">
                  &ldquo;{t('home.cta.pullQuote')}&rdquo;
                </blockquote>

                <p className="mb-8 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
                  {t('home.cta.introBody')}
                </p>

                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 md:p-6">
                  <p className="mb-3.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {t('home.cta.connectionLabelShort')}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {connectNodes.map((node, i) => (
                      <React.Fragment key={node}>
                        <span className="whitespace-nowrap rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
                          {node}
                        </span>
                        {i < connectNodes.length - 1 && (
                          <span className="text-base font-bold text-primary/50">⇄</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {panelIndex === 2 && (
            <div className="absolute inset-0 flex animate-slide-up flex-col items-center justify-center px-8 py-8 md:px-20">
              <p className="mb-7 max-w-xl text-center text-sm leading-relaxed text-muted-foreground md:text-base">
                {t('home.cta.ecosystemTagline')}
              </p>

              <div className="relative mb-6 h-[220px] w-full max-w-3xl overflow-hidden rounded-2xl border border-primary/25 shadow-[0_0_60px_rgba(0,217,255,0.1)] md:h-[260px]">
                <img
                  src={SECTION_IMAGES[2]}
                  alt={t('home.cta.ecosystemBadge')}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="mb-8 flex flex-wrap items-center justify-center gap-3 md:gap-5">
                {pillItems.map((pill) => (
                  <div
                    key={pill}
                    className="rounded-full border border-primary/40 bg-primary/15 px-4 py-2 text-sm font-semibold text-foreground md:px-5 md:py-2.5"
                  >
                    {pill}
                  </div>
                ))}
              </div>

              <Link
                href="/auth"
                className="rounded-xl bg-gradient-to-r from-primary to-secondary px-10 py-4 text-base font-bold text-primary-foreground shadow-[0_4px_24px_rgba(0,217,255,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,217,255,0.5)]"
              >
                {t('home.cta.signUpFree')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
};
