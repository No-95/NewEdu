'use client';

import React from 'react';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
import { Navigation } from '@/components/Navigation';
import { Header } from '@/components/Header';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import { HeroSection } from '@/components/sections/HeroSection';
import { EcosystemSection } from '@/components/sections/EcosystemSection';
import { HomeClosingSection } from '@/components/sections/HomeClosingSection';

const TOTAL_PAGES = 5;

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

          {/* Section 2: Ecosystem */}
          <EcosystemSection pageNumber={1} totalPages={TOTAL_PAGES} />

          {/* Section 3: Why Choose */}
          <HomeClosingSection
            sectionId="why-choose"
            panelIndex={0}
            pageNumber={2}
            totalPages={TOTAL_PAGES}
          />

          {/* Section 4: Connection */}
          <HomeClosingSection
            sectionId="connection"
            panelIndex={1}
            pageNumber={3}
            totalPages={TOTAL_PAGES}
          />

          {/* Section 5: Ecosystem CTA */}
          <HomeClosingSection
            sectionId="cta"
            panelIndex={2}
            pageNumber={4}
            totalPages={TOTAL_PAGES}
          />
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
