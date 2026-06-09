'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';

import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
import { api } from '@/convex/_generated/api';
import { useLanguage } from '@/lib/context/LanguageContext';
import { COURSE_TEXT, getCourseLanguage } from '@/lib/courses/localization';
import CourseAction from './CourseAction';

export function CoursesCatalogClient() {
  const { language } = useLanguage();
  const locale = getCourseLanguage(language);
  const text = COURSE_TEXT[locale].catalog;
  const courses = useQuery(api.courses.getPublishedCourses, {});
  const seedCatalog = useMutation(api.courses.seedCourseCatalog);
  const hasSeededRef = useRef(false);

  useEffect(() => {
    if (hasSeededRef.current) {
      return;
    }

    if (courses && courses.length === 0) {
      hasSeededRef.current = true;
      void seedCatalog({});
    }
  }, [courses, seedCatalog]);

  const course = courses?.[0];
  const totalCourses = courses?.length ?? 0;
  const totalVideos = courses?.reduce((sum, item) => sum + item.lectures.length, 0) ?? 0;
  const hasFreeCourse = courses?.some((item) => item.isFree) ?? false;
  const forcePurchase = (process.env.NEXT_PUBLIC_FORCE_PURCHASE || '') === '1'

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      <Header />

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-24">
        <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background/90 via-background/75 to-cyan-500/10 p-8 shadow-[0_20px_60px_-35px_rgba(56,189,248,0.8)] backdrop-blur-md md:p-10">
          <div className="courses-decor-circle pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="courses-decor-circle pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-emerald-400/15 blur-3xl" />

          <div className="relative space-y-5">
            <p className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {text.learningHub}
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-foreground md:text-5xl">
              {text.heroTitle}
            </h1>
            <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
              {text.heroDescription}
            </p>

            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/50 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{text.publishedCourses}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{totalCourses}</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{text.totalLectures}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{totalVideos}</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{text.accessModel}</p>
                <div className="mt-2">
                  <Link href="/courses/classroom" className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                    {text.onlineClassroom}
                  </Link>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{text.viewOnlineRooms}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{text.catalogEyebrow}</p>
              <h2 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">{text.catalogTitle}</h2>
            </div>
          </div>

          {!course ? (
            <div className="rounded-2xl border border-border/50 bg-background/70 p-6 text-muted-foreground">
              {text.loading}
            </div>
          ) : (
            <div className="group block overflow-hidden rounded-3xl border border-border/60 bg-background/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-[0_20px_45px_-30px_rgba(34,211,238,0.7)]">
              <div className="grid gap-0 md:grid-cols-[1.6fr_1fr]">
                <div className="p-7 md:p-8">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {!course.isFree && course.badge ? (
                      <span className="rounded-full border border-emerald-300/40 bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                        {course.badge}
                      </span>
                    ) : null}
                    {!course.isFree ? (
                      <span className="rounded-full border border-amber-300/50 bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-100">
                        {text.giftBookTag}
                      </span>
                    ) : null}
                    <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {text.teacherTeam}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-foreground transition-colors group-hover:text-primary md:text-3xl">
                    {course.title}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground md:text-base">{course.subtitle}</p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-border/50 bg-background/60 p-3">
                      <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{text.videosReady}</p>
                      <p className="mt-1 text-xl font-bold text-foreground">{course.lectures.length}</p>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-background/60 p-3">
                      <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{text.streaming}</p>
                      <p className="mt-1 text-xl font-bold text-cyan-300">{text.hlsStreaming}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between border-l border-border/50 bg-muted/20 p-7 md:p-8">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{text.flowTitle}</p>
                    <ul className="mt-4 space-y-3 text-sm text-foreground/90">
                      <li>{text.flowItem1}</li>
                      <li>{text.flowItem2}</li>
                      <li>{text.flowItem3}</li>
                    </ul>
                  </div>

                  <CourseAction
                    courseSlug={course.slug}
                    isFree={forcePurchase ? false : course.isFree}
                    price={course.price}
                  />
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
