'use client';

import React from 'react';
import { Section } from '@/components/Section';
import { useLanguage } from '@/lib/context/LanguageContext';

interface TrustSectionProps {
  pageNumber: number;
  totalPages: number;
}

export const TrustSection: React.FC<TrustSectionProps> = ({ pageNumber, totalPages }) => {
  const { t } = useLanguage();
  const metrics = [
    {
      label: t('home.trust.userRetention'),
      value: '94%',
      description: t('home.trust.retentionDesc'),
      delay: '0s',
    },
    {
      label: t('home.trust.fluencyAchievement'),
      value: '89%',
      description: t('home.trust.fluencyDesc'),
      delay: '0.1s',
    },
    {
      label: t('home.trust.dailyEngagement'),
      value: '78%',
      description: t('home.trust.engagementDesc'),
      delay: '0.2s',
    },
    {
      label: t('home.trust.expertInstructors'),
      value: '100+',
      description: t('home.trust.instructorsDesc'),
      delay: '0.3s',
    },
  ];

  return (
    <Section
      id="trust"
      pageNumber={pageNumber}
      totalPages={totalPages}
      showPageIndicator={true}
      className="relative"
    >
      <div className="relative z-10 w-full max-w-6xl px-6 py-20">
        <div className="space-y-16">
          {/* Header */}
          <div className="text-center space-y-4 animate-slide-up">
            <h2 className="text-5xl md:text-6xl font-bold">{t('home.trust.title')}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('home.trust.description')}
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="glass rounded-xl p-8 text-center hover:shadow-glow-cyan transition-all duration-300 transform hover:scale-105 animate-slide-up"
                style={{ animationDelay: metric.delay }}
              >
                <div className="space-y-3">
                  <div className="text-4xl font-bold text-primary glow-cyan">{metric.value}</div>
                  <h3 className="text-lg font-semibold text-foreground">{metric.label}</h3>
                  <p className="text-sm text-muted-foreground">{metric.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 pt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="glass rounded-lg px-6 py-3 text-sm font-medium">
              ⭐ {t('home.trust.topRated')}
            </div>
            <div className="glass rounded-lg px-6 py-3 text-sm font-medium">
              🏆 {t('home.trust.awardWinning')}
            </div>
            <div className="glass rounded-lg px-6 py-3 text-sm font-medium">
              🔒 {t('home.trust.isoCertified')}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};
