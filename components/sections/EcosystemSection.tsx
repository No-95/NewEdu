'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Section } from '@/components/Section';
import { useLanguage } from '@/lib/context/LanguageContext';

interface EcosystemSectionProps {
  pageNumber: number;
  totalPages: number;
}

const personaSlides = [
  {
    key: 'learners',
    href: '/courses',
    prefix: 'home.ecosystem.learners',
    descriptionField: 'description' as const,
    image: '/homepage/section21.png',
  },
  {
    key: 'teachers',
    href: '/teacher-center',
    prefix: 'home.ecosystem.teachers',
    descriptionField: 'description' as const,
    image: '/homepage/section22.png',
  },
  {
    key: 'jobSeekers',
    href: '/career/jobs',
    prefix: 'home.ecosystem.jobSeekers',
    descriptionField: 'description' as const,
    image: '/homepage/section23.png',
  },
  {
    key: 'employers',
    href: '/business/recruitment',
    prefix: 'home.ecosystem.employers',
    descriptionField: 'description' as const,
    image: '/homepage/section24.png',
  },
  {
    key: 'experts',
    href: '/experts/network',
    prefix: 'home.ecosystem.experts',
    descriptionField: 'description' as const,
    image:
      'https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    key: 'community',
    href: '/community',
    prefix: 'home.community',
    descriptionField: 'subtitle' as const,
    image: '/homepage/section25.png',
  },
] as const;

export const EcosystemSection: React.FC<EcosystemSectionProps> = ({ pageNumber, totalPages }) => {
  const { t } = useLanguage();
  const [currentSection, setCurrentSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  const totalSlides = personaSlides.length;
  const activeSlide = personaSlides[currentSection];

  const getSlideContent = (slide: (typeof personaSlides)[number]) => {
    const bullets = t(`${slide.prefix}.bullets`, { returnObjects: true });
    return {
      title: t(`${slide.prefix}.title`),
      subtitle: t(`${slide.prefix}.${slide.descriptionField}`),
      points: Array.isArray(bullets) ? bullets : [],
      cta: t(`${slide.prefix}.cta`),
    };
  };

  const slideContent = getSlideContent(activeSlide);

  const navigateSlide = useCallback(
    (direction: 'up' | 'down' | number) => {
      if (isScrollingRef.current) return;

      let nextIndex: number | null = null;

      if (typeof direction === 'number') {
        if (direction >= 0 && direction < totalSlides) {
          nextIndex = direction;
        }
      } else if (direction === 'down' && currentSection < totalSlides - 1) {
        nextIndex = currentSection + 1;
      } else if (direction === 'up' && currentSection > 0) {
        nextIndex = currentSection - 1;
      }

      if (nextIndex === null) return;

      isScrollingRef.current = true;
      setIsScrolling(true);
      setCurrentSection(nextIndex);
      window.setTimeout(() => {
        isScrollingRef.current = false;
        setIsScrolling(false);
      }, 800);
    },
    [currentSection, totalSlides]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.setAttribute('data-carousel-at-start', currentSection === 0 ? 'true' : 'false');
    container.setAttribute('data-carousel-at-end', currentSection === totalSlides - 1 ? 'true' : 'false');
  }, [currentSection, totalSlides]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handler = (event: Event) => {
      const { direction } = (event as CustomEvent<{ direction: 'up' | 'down' }>).detail;
      navigateSlide(direction);
    };

    container.addEventListener('section-carousel-step', handler);
    return () => container.removeEventListener('section-carousel-step', handler);
  }, [navigateSlide]);

  return (
    <Section
      id="ecosystem"
      pageNumber={pageNumber}
      totalPages={totalPages}
      showPageIndicator={true}
      fillHeight
      className="relative !items-stretch !justify-stretch"
    >
      <div
        ref={containerRef}
        data-section-scroll="true"
        data-section-scroll-mode="carousel"
        data-carousel-at-start="true"
        data-carousel-at-end="false"
        className="relative flex h-full w-full flex-col pt-16 pb-12"
      >
        <div className="flex h-[14vh] shrink-0 items-center justify-center bg-gradient-to-b from-primary/10 to-transparent px-8">
          <h2 className="text-center text-3xl font-bold tracking-wide text-foreground md:text-4xl lg:text-5xl">
            {t('home.ecosystem.title')}
          </h2>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden pb-4 md:pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="h-full w-full"
            >
              <div className="flex h-full w-full items-center justify-center px-6 pb-6 md:px-8 md:pb-8">
                <div className="flex h-[90%] w-full max-w-7xl items-center gap-8 lg:gap-12">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="hidden h-full flex-1 overflow-hidden rounded-2xl border-2 border-primary/30 shadow-2xl lg:block"
                  >
                    <img
                      src={activeSlide.image}
                      alt={slideContent.title}
                      className="h-full w-full object-cover"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex h-full flex-1 flex-col justify-center"
                  >
                    <h3 className="mb-4 text-3xl font-bold text-primary md:text-4xl">{slideContent.title}</h3>
                    <p className="mb-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
                      {slideContent.subtitle}
                    </p>

                    <div className="mb-8 space-y-3">
                      {slideContent.points.map((point, idx) => (
                        <motion.div
                          key={point}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <span className="mt-1 shrink-0 text-primary">✓</span>
                          <span className="text-foreground/90">{point}</span>
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.9 }}
                    >
                      <Link
                        href={activeSlide.href}
                        className="inline-flex self-start rounded-lg bg-gradient-to-r from-primary to-secondary px-8 py-4 font-semibold text-primary-foreground shadow-lg transition-all hover:shadow-[0_0_28px_rgba(0,217,255,0.45)]"
                      >
                        {slideContent.cta}
                      </Link>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-4 md:flex">
          <button
            type="button"
            onClick={() => navigateSlide('up')}
            disabled={currentSection === 0 || isScrolling}
            className="rounded-full border border-primary/30 bg-primary/20 p-3 text-primary backdrop-blur-sm transition-all hover:bg-primary/40 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Previous slide"
          >
            <ChevronUp size={24} />
          </button>

          <div className="flex flex-col items-center gap-2 py-2">
            {personaSlides.map((slide, idx) => (
              <button
                key={slide.key}
                type="button"
                onClick={() => navigateSlide(idx)}
                disabled={isScrolling}
                className={`h-3 w-3 rounded-full transition-all ${
                  idx === currentSection
                    ? 'scale-125 bg-primary'
                    : 'bg-primary/30 hover:bg-primary/60'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigateSlide('down')}
            disabled={currentSection === totalSlides - 1 || isScrolling}
            className="rounded-full border border-primary/30 bg-primary/20 p-3 text-primary backdrop-blur-sm transition-all hover:bg-primary/40 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Next slide"
          >
            <ChevronDown size={24} />
          </button>
        </div>
      </div>
    </Section>
  );
};
