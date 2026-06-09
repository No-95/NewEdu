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
    { value: '50.000+', label: t('home.trust.communityMembers') },
    { value: '10.000+', label: t('home.trust.learnersWorkers') },
    { value: '500+', label: t('home.trust.teachersExperts') },
    { value: '1.000+', label: t('home.trust.partnerBusinesses') },
    { value: '10.000+', label: t('home.trust.jobOpportunities') },
    { value: '100.000+', label: t('home.trust.learningResources') },
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="glass rounded-xl p-8 text-center hover:shadow-glow-cyan transition-all duration-300 transform hover:scale-105 animate-slide-up"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="text-3xl md:text-4xl font-bold text-primary glow-cyan mb-2">
                {metric.value}
              </div>
              <p className="text-sm md:text-base font-medium text-foreground">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};
