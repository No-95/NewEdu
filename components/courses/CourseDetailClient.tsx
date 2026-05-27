'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';

import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/ParticleBackground';
import { CourseOutlineSidebar } from '@/components/courses/CourseOutlineSidebar';
import { api } from '@/convex/_generated/api';
import { useLanguage } from '@/lib/context/LanguageContext';
import { COURSE_TEXT, getCourseLanguage } from '@/lib/courses/localization';

interface CourseDetailClientProps {
  courseSlug: string;
}

export function CourseDetailClient({ courseSlug }: CourseDetailClientProps) {
  const { language } = useLanguage();
  const locale = getCourseLanguage(language);
  const text = COURSE_TEXT[locale].detail;
  const course = useQuery(api.courses.getCourseBySlug, { slug: courseSlug });

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <ParticleBackground />
        <Header />
        <main className="relative z-10 mx-auto max-w-5xl px-6 pb-16 pt-24">
          <div className="rounded-2xl border border-border/50 bg-background/70 p-6 text-muted-foreground">
            {text.loading}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      <Header />

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-24">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_360px]">
          <section className="space-y-6">
            <div className="rounded-2xl border border-border/50 bg-background/70 p-6 backdrop-blur-sm">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground md:text-4xl">{course.title}</h1>
                <span className="rounded-full border border-emerald-300/40 bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                  {course.badge}
                </span>
              </div>
              <p className="text-muted-foreground">{course.subtitle}</p>
              <p className="mt-2 text-sm text-muted-foreground/90">{course.description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/50 bg-background/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{text.totalUnits}</p>
                <p className="mt-2 text-2xl font-bold text-foreground">15</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-background/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{text.totalVideos}</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{course.totalVideos}</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-background/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{text.access}</p>
                <p className="mt-2 text-2xl font-bold text-emerald-300">{text.free}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-background/60 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{text.getStarted}</p>
              <h2 className="mt-2 text-2xl font-bold text-foreground">{text.startTitle}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {text.startDescription}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/courses/${course.slug}/${course.lectures[0]?.videoFolderName}`}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  {text.watchFirst}
                </Link>
                <Link
                  href={`/courses/${course.slug}/${course.lectures[course.lectures.length - 1]?.videoFolderName}`}
                  className="rounded-xl border border-border/60 bg-muted/40 px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted/70"
                >
                  {text.jumpLast}
                </Link>
              </div>
            </div>
          </section>

          <CourseOutlineSidebar courseId={course.slug} title={course.title} lectures={course.lectures} />
        </div>
      </main>
    </div>
  );
}
