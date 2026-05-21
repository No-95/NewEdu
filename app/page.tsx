'use client';

import React from 'react';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Navigation } from '@/components/Navigation';
import { Header } from '@/components/Header';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import { HeroSection } from '@/components/sections/HeroSection';
import { TrustSection } from '@/components/sections/TrustSection';
import { LearningSection } from '@/components/sections/LearningSection';
import { CoursesSection } from '@/components/sections/CoursesSection';
import { JobsSection } from '@/components/sections/JobsSection';
import { CommunitySection } from '@/components/sections/CommunitySection';
import { CTASection } from '@/components/sections/CTASection';

const TOTAL_PAGES = 7;

export default function Home() {
  const { currentPage, isTransitioning, nextPage, prevPage, canGoNext, canGoPrev } =
    usePageNavigation(TOTAL_PAGES);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      <Header />
      <ParticleBackground />

      {/* Page Container */}
      <div className="relative z-10 w-full h-full perspective pointer-events-auto">
        <div
          className="flex h-full transition-transform duration-700 ease-out pointer-events-auto"
          style={{
            transform: `translateX(-${currentPage * 100}vw)`,
            width: `${TOTAL_PAGES * 100}vw`,
          }}
        >
          {/* Section 1: Hero */}
          <HeroSection pageNumber={0} totalPages={TOTAL_PAGES} />

          {/* Section 2: Trust Metrics */}
          <TrustSection pageNumber={1} totalPages={TOTAL_PAGES} />

          {/* Section 3: Learning Experience */}
          <LearningSection pageNumber={2} totalPages={TOTAL_PAGES} />

          {/* Section 4: Course Categories */}
          <CoursesSection pageNumber={3} totalPages={TOTAL_PAGES} />

          {/* Section 5: Jobs & Opportunities */}
          <JobsSection pageNumber={4} totalPages={TOTAL_PAGES} />

          {/* Section 6: Community */}
          <CommunitySection pageNumber={5} totalPages={TOTAL_PAGES} />

          {/* Section 7: Final CTA */}
          <CTASection pageNumber={6} totalPages={TOTAL_PAGES} />
        </div>
      </div>

      <Navigation
        canGoNext={canGoNext}
        canGoPrev={canGoPrev}
        onNext={nextPage}
        onPrev={prevPage}
        currentPage={currentPage}
        totalPages={TOTAL_PAGES}
      />
    </div>
  );
}
