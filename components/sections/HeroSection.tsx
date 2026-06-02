'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Section } from '@/components/Section';
import { ImageCube } from '@/components/ImageCube';
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
  return (
    <Section
      id="hero"
      pageNumber={pageNumber}
      totalPages={totalPages}
      showPageIndicator={true}
      className="relative pt-20"
    >
      <div className="relative z-10 w-full max-w-6xl px-6">
        {/* Background decorative elements */}
        <div className="hero-bg-circle absolute top-1/4 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="hero-bg-circle absolute bottom-1/4 right-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Main content - Two column layout */}
        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          {/* Left Column - Text Content */}
          <div className="space-y-6 animate-slide-up text-center lg:text-left">
            <div className="inline-block">
              <span className="px-4 py-1.5 text-xs font-medium bg-primary/10 border border-primary/20 rounded-full text-primary">
                {t('home.hero.badge')}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              {t('home.hero.title')}
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
              {t('home.hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link
                href="/courses"
                className="px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:shadow-[0_0_30px_rgba(0,217,255,0.5)] transition-all duration-300 transform hover:scale-105"
              >
                {t('home.hero.startLearning')}
              </Link>
              <Link
                href="/teacher-applicant"
                className="px-8 py-3.5 border border-secondary text-secondary font-semibold rounded-lg hover:bg-secondary/10 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {t('home.hero.becomeTeacher')}
              </Link>
            </div>

            {/* Stats Row */}
            <div className="pt-8 flex flex-wrap justify-center lg:justify-start gap-8">
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">{t('home.hero.activeLearners')}</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-secondary">1,200+</div>
                <div className="text-sm text-muted-foreground">{t('home.hero.expertTeachers')}</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">{t('home.hero.videoCourses')}</div>
              </div>
            </div>
          </div>

          {/* Right Column - 3D Cube */}
          <div className="flex justify-center items-center animate-slide-in-right">
            <div className="relative">
              {/* Floating elements around cube */}
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
              
              {/* The 3D Cube */}
              <ImageCube 
                size={300}
                images={heroImages}
              />
              
              {/* Hover instruction */}
              <p className="text-center text-xs text-muted-foreground mt-12">
                {t('home.hero.hoverRotate')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-muted-foreground">{t('home.hero.scrollExplore')}</span>
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </Section>
  );
};
