'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Section } from '@/components/Section';
import { useLanguage } from '@/lib/context/LanguageContext';

interface CTASectionProps {
  pageNumber: number;
  totalPages: number;
}

export const CTASection: React.FC<CTASectionProps> = ({ pageNumber, totalPages }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');

  return (
    <Section
      id="cta"
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
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                {t('home.cta.joinTitle')} <span className="neon-text">HDP EDU</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                {t('home.cta.subtitle')}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-2 p-1.5 bg-muted rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('student')}
                className={`px-5 py-2.5 text-base font-medium rounded-md transition-all ${
                  activeTab === 'student'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('home.cta.iWantToLearn')}
              </button>
              <button
                onClick={() => setActiveTab('teacher')}
                className={`px-5 py-2.5 text-base font-medium rounded-md transition-all ${
                  activeTab === 'teacher'
                    ? 'bg-secondary text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('home.cta.iWantToTeach')}
              </button>
            </div>

            {/* Student Content */}
            {activeTab === 'student' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
                  {[t('home.cta.sevenDayTrial'), t('home.cta.fullCourseAccess'), t('home.cta.support24')].map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary fill-primary" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/auth"
                  className="inline-block px-8 py-3 bg-primary text-primary-foreground font-semibold text-base rounded-lg hover:shadow-glow-cyan transition-all duration-300"
                >
                  {t('home.cta.startLearningFree')}
                </Link>
              </div>
            )}

            {/* Teacher Content */}
            {activeTab === 'teacher' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
                  {[t('home.cta.sellCourses'), t('home.cta.setOwnPrice'), t('home.cta.globalReach')].map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-secondary fill-secondary" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/teacher-applicant"
                  className="inline-block px-8 py-3 bg-secondary text-white font-semibold text-base rounded-lg hover:shadow-glow-blue transition-all duration-300"
                >
                  {t('home.cta.applyTeach')}
                </Link>
              </div>
            )}

            {/* Email signup */}
            <div className="space-y-3 pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground">{t('home.cta.getNotified')}</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 text-base bg-input text-foreground rounded-lg border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                />
                <Link
                  href="/contact-us"
                  className="inline-block px-5 py-3 bg-muted text-foreground text-base font-medium rounded-lg hover:bg-muted/80 transition-all"
                >
                  {t('home.cta.subscribe')}
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Image */}
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="relative w-full h-full rounded-xl overflow-hidden aspect-[4/3]">
              <Image
                src="/homepage/CTAsection.png"
                alt="Join HDP EDU"
                width={500}
                height={375}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            {/* Footer compact */}
            <div className="mt-6 pt-4 border-t border-border/50 text-center">
              <p className="text-xs text-muted-foreground">
                {t('home.cta.copyright')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};
