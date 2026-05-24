'use client';

import React from 'react';
import Image from 'next/image';
import { Section } from '@/components/Section';
import { useLanguage } from '@/lib/context/LanguageContext';

interface JobsSectionProps {
  pageNumber: number;
  totalPages: number;
}

export const JobsSection: React.FC<JobsSectionProps> = ({ pageNumber, totalPages }) => {
  const { t } = useLanguage();
  const opportunities = [
    { title: 'Corporate Translation', salary: '$60K - $90K' },
    { title: 'Content Creator', salary: '$40K - $70K' },
    { title: 'Language Instructor', salary: '$50K - $80K' },
    { title: 'International Business', salary: '$70K - $110K' },
  ];

  const companies = ['Samsung', 'LG', 'Hyundai', 'Naver', 'Kakao'];

  return (
    <Section
      id="jobs"
      pageNumber={pageNumber}
      totalPages={totalPages}
      showPageIndicator={true}
      className="relative"
    >
      <div className="relative z-10 w-full max-w-7xl px-8 py-12 pt-28">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          {/* Left: Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-3">
              <h2 className="text-4xl md:text-5xl font-bold">{t('home.jobs.careerTitle')}</h2>
              <p className="text-lg text-muted-foreground">
                {t('home.jobs.subtitle')}
              </p>
            </div>

            {/* Opportunities */}
            <div className="grid grid-cols-2 gap-4">
              {opportunities.map((opp, index) => (
                <div
                  key={index}
                  className="glass rounded-lg p-4 hover:shadow-glow-cyan transition-all duration-300"
                >
                  <div className="text-primary font-bold text-base">{opp.salary}</div>
                  <h3 className="text-base font-semibold text-foreground">{opp.title}</h3>
                </div>
              ))}
            </div>

            {/* Companies */}
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-3 text-center">{t('home.jobs.topEmployers')}</p>
              <div className="flex flex-wrap justify-center gap-3">
                {companies.map((company) => (
                  <span key={company} className="px-4 py-1.5 rounded bg-white/5 text-sm font-medium">
                    {company}
                  </span>
                ))}
              </div>
            </div>

            <button className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white text-base font-semibold rounded-lg hover:shadow-glow-cyan transition-all">
              {t('home.jobs.viewCareerBoard')}
            </button>
          </div>

          {/* Right: Image */}
          <div className="animate-fade-in md:h-full" style={{ animationDelay: '0.3s' }}>
            <div className="relative w-full h-80 md:h-full rounded-xl overflow-hidden">
              <Image
                src="/homepage/section5.png"
                alt="Career Opportunities"
                fill
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};
