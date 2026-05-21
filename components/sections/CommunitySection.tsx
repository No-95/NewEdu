'use client';

import React from 'react';
import Image from 'next/image';
import { Section } from '@/components/Section';
import { useLanguage } from '@/lib/context/LanguageContext';

interface CommunitySectionProps {
  pageNumber: number;
  totalPages: number;
}

export const CommunitySection: React.FC<CommunitySectionProps> = ({ pageNumber, totalPages }) => {
  const { t } = useLanguage();
  const stats = [
    { label: t('home.community.learners'), value: '50K+' },
    { label: t('home.community.countries'), value: '180+' },
    { label: t('home.community.support'), value: '24/7' },
  ];

  const testimonials = [
    { text: 'HDP EDU changed my life. I went from complete beginner to conversational in 6 months!', author: 'Sarah Chen', role: 'Product Manager' },
    { text: 'The community here is incredible. Everyone is supportive and motivating.', author: 'Marcus Johnson', role: 'Language Enthusiast' },
  ];

  return (
    <Section
      id="community"
      pageNumber={pageNumber}
      totalPages={totalPages}
      showPageIndicator={true}
      className="relative"
    >
      <div className="relative z-10 w-full max-w-7xl px-8 py-12 pt-28">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          {/* Left: Image */}
          <div className="order-2 md:order-1 animate-fade-in">
            <div className="relative w-full rounded-xl overflow-hidden min-h-[500px]">
              <Image
                src="/homepage/section6.png"
                alt="Community"
                width={400}
                height={300}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>

          {/* Right: Content */}
          <div className="order-1 md:order-2 space-y-8 animate-slide-up">
            <div className="space-y-3">
              <h2 className="text-4xl md:text-5xl font-bold">{t('home.community.joinTitle')}</h2>
              <p className="text-lg text-muted-foreground">
                {t('home.community.subtitle')}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center glass rounded-lg p-3">
                  <div className="text-xl font-bold text-primary">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="space-y-4">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="glass rounded-lg p-3">
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3.5 h-3.5 text-primary fill-primary" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-foreground italic mb-2">&quot;{testimonial.text}&quot;</p>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{testimonial.author}</p>
                      <p className="text-[10px] text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};
