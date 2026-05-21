'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/ParticleBackground';
import { useLanguage } from '@/lib/context/LanguageContext';
import { ClientOnly } from '@/lib/hooks/useClientOnly';

interface Course {
  id: number;
  title: string;
  level: string;
  duration: string;
  students: number;
  price: string;
  instructor: string;
  rating: number;
  description: string;
  color: string;
}

function CoursesContent() {
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const { t } = useLanguage();

  const courses: Course[] = [
    {
      id: 1,
      title: 'Korean Basics A1',
      level: 'Beginner',
      duration: '8 weeks',
      students: 2340,
      price: '$49',
      instructor: 'Dr. Park',
      rating: 4.8,
      description: 'Learn fundamental Korean pronunciation and basic conversational phrases',
      color: 'emerald',
    },
    {
      id: 2,
      title: 'Daily Conversations A2',
      level: 'Beginner',
      duration: '8 weeks',
      students: 1890,
      price: '$49',
      instructor: 'Ms. Kim',
      rating: 4.9,
      description: 'Master everyday conversations in restaurants, shops, and more',
      color: 'emerald',
    },
    {
      id: 3,
      title: 'Business Korean B1',
      level: 'Intermediate',
      duration: '12 weeks',
      students: 1200,
      price: '$79',
      instructor: 'Mr. Lee',
      rating: 4.7,
      description: 'Advanced business vocabulary and professional communication',
      color: 'cyan',
    },
    {
      id: 4,
      title: 'K-Drama Mastery B2',
      level: 'Intermediate',
      duration: '10 weeks',
      students: 3450,
      price: '$69',
      instructor: 'Ms. Choi',
      rating: 4.9,
      description: 'Understand K-drama without subtitles and grasp cultural nuances',
      color: 'cyan',
    },
    {
      id: 5,
      title: 'Professional Writing C1',
      level: 'Advanced',
      duration: '14 weeks',
      students: 450,
      price: '$129',
      instructor: 'Prof. Jung',
      rating: 4.9,
      description: 'Master advanced writing for professional and academic contexts',
      color: 'blue',
    },
    {
      id: 6,
      title: 'Literary Korean C2',
      level: 'Advanced',
      duration: '16 weeks',
      students: 320,
      price: '$149',
      instructor: 'Prof. Kang',
      rating: 5.0,
      description: 'Explore Korean literature and master nuanced language usage',
      color: 'blue',
    },
  ];

  const filteredCourses =
    selectedLevel === 'all'
      ? courses
      : courses.filter((c) => c.level === selectedLevel);

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      <Header />

      <main className="relative z-10 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header Section */}
          <div className="mb-12 animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t('courses.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              {t('courses.description')}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-3 mb-12 animate-fade-in">
            {['all', 'Beginner', 'Intermediate', 'Advanced'].map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                  selectedLevel === level
                    ? 'bg-primary text-primary-foreground shadow-glow-cyan'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {level === 'all' ? t('courses.allCourses') : t(`courses.${level.toLowerCase()}`)}
              </button>
            ))}
          </div>

          {/* Courses Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <div
                key={course.id}
                className="glass rounded-xl p-6 hover:shadow-glow-cyan transition-all duration-300 group cursor-pointer border border-border/50 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{course.instructor}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                      {course.level}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4">{course.description}</p>

                {/* Meta Info */}
                <div className="space-y-2 mb-4 pb-4 border-b border-border/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('courses.duration')}</span>
                    <span className="text-foreground font-medium">{course.duration}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('courses.students')}</span>
                    <span className="text-foreground font-medium">{course.students.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('courses.rating')}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-foreground font-medium">{course.rating}</span>
                      <span className="text-primary">★</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">{course.price}</span>
                  <button className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all text-sm font-medium">
                    {t('common.enrollNow')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <ClientOnly>
      <CoursesContent />
    </ClientOnly>
  );
}
