'use client';

import React from 'react';
import Image from 'next/image';
import { Section } from '@/components/Section';
import { useLanguage } from '@/lib/context/LanguageContext';

interface LearningSectionProps {
  pageNumber: number;
  totalPages: number;
}

export const LearningSection: React.FC<LearningSectionProps> = ({ pageNumber, totalPages }) => {
  const { t } = useLanguage();
  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: t('home.learning.aiCurriculum'),
      description: t('home.learning.aiDesc'),
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: t('home.learning.conversation'),
      description: t('home.learning.conversationDesc'),
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: t('home.learning.learnAnywhere'),
      description: t('home.learning.learnDesc'),
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: t('home.learning.liveClasses'),
      description: t('home.learning.liveDesc'),
    },
  ];

  return (
    <Section
      id="learning"
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
              <h2 className="text-4xl md:text-5xl font-bold">{t('home.learning.title')}</h2>
              <p className="text-lg text-muted-foreground">
                {t('home.learning.subtitle')}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-5">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="glass rounded-lg p-4 hover:shadow-glow-cyan transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Image */}
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="relative w-full h-full rounded-xl overflow-hidden">
              <Image
                src="/homepage/section3.png"
                alt="Learning Experience"
                width={400}
                height={300}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};
