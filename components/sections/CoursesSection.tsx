'use client';

import React from 'react';
import Image from 'next/image';
import { Section } from '@/components/Section';
import { useLanguage } from '@/lib/context/LanguageContext';

interface CoursesSectionProps {
  pageNumber: number;
  totalPages: number;
}

export const CoursesSection: React.FC<CoursesSectionProps> = ({ pageNumber, totalPages }) => {
  const { t } = useLanguage();
  const courses = [
    {
      title: 'Beginner',
      subtitle: t('home.courses.startJourney'),
      level: 'A1-A2',
      duration: '3 months',
      color: 'from-emerald-500/20 to-emerald-500/5',
      borderColor: 'border-emerald-500/30',
    },
    {
      title: 'Intermediate',
      subtitle: t('home.courses.buildFluency'),
      level: 'B1-B2',
      duration: '4 months',
      color: 'from-primary/20 to-primary/5',
      borderColor: 'border-primary/30',
    },
    {
      title: 'Advanced',
      subtitle: t('home.courses.professionalMastery'),
      level: 'C1-C2',
      duration: '5 months',
      color: 'from-secondary/20 to-secondary/5',
      borderColor: 'border-secondary/30',
    },
  ];

  return (
    <Section
      id="courses"
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
                src="/homepage/section4.png"
                alt="Courses"
                width={400}
                height={300}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>

          {/* Right: Content */}
          <div className="order-1 md:order-2 space-y-8 animate-slide-up">
            <div className="space-y-3">
              <h2 className="text-4xl md:text-5xl font-bold">{t('home.courses.exploreTitle')}</h2>
              <p className="text-lg text-muted-foreground">
                {t('home.courses.subtitle')}
              </p>
            </div>

            {/* Course Cards */}
            <div className="space-y-5">
              {courses.map((course, index) => (
                <div
                  key={index}
                  className={`glass rounded-lg p-5 hover:shadow-glow-cyan transition-all duration-300 cursor-pointer group bg-gradient-to-r ${course.color} border ${course.borderColor}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{course.title}</h3>
                      <p className="text-primary text-base">{course.subtitle}</p>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-muted-foreground">Level: <span className="text-primary font-medium">{course.level}</span></div>
                      <div className="text-muted-foreground">{course.duration}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full px-6 py-3 bg-primary text-primary-foreground text-base font-semibold rounded-lg hover:shadow-glow-cyan transition-all">
              {t('home.courses.viewAllCourses')}
            </button>
          </div>
        </div>
      </div>
    </Section>
  );
};
