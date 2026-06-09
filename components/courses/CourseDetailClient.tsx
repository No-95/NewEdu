'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from 'convex/react';

import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
import { CourseOutlineSidebar } from '@/components/courses/CourseOutlineSidebar';
import { api } from '@/convex/_generated/api';
import { useCourseAccess } from '@/hooks/useCourseAccess';
import { useLanguage } from '@/lib/context/LanguageContext';
import { COURSE_TEXT, formatCourseTemplate, getCourseLanguage } from '@/lib/courses/localization';
import { formatVndPrice } from '@/lib/currency';

interface CourseDetailClientProps {
  courseSlug: string;
}

export function CourseDetailClient({ courseSlug }: CourseDetailClientProps) {
  const searchParams = useSearchParams();
  const paidStatus = searchParams.get('paid');
  const { language } = useLanguage();
  const locale = getCourseLanguage(language);
  const text = COURSE_TEXT[locale].detail;
  const course = useQuery(api.courses.getCourseBySlug, { slug: courseSlug });
  const { loading: accessLoading, syncingPayment, hasAccess } = useCourseAccess(
    courseSlug,
    !!course?.isFree,
    { syncAfterPayment: paidStatus === '1' }
  );

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

  const coursePrice = course.price ?? 399_000;
  const canWatch = course.isFree || hasAccess;
  const firstLecture = course.lectures[0]?.videoFolderName;
  const lastLecture = course.lectures[course.lectures.length - 1]?.videoFolderName;

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      <Header />

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-24">
        {paidStatus === '1' && syncingPayment ? (
          <div className="mb-6 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-foreground">
            {text.confirmingPayment}
          </div>
        ) : null}
        {paidStatus === '1' && !syncingPayment && hasAccess ? (
          <div className="mb-6 rounded-xl border border-emerald-300/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            {text.paymentSuccess}
          </div>
        ) : null}
        {paidStatus === '1' && !syncingPayment && !hasAccess && !accessLoading ? (
          <div className="mb-6 rounded-xl border border-amber-300/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            {text.paymentSyncing}
          </div>
        ) : null}
        {paidStatus === '0' ? (
          <div className="mb-6 rounded-xl border border-amber-300/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            {text.paymentCancelled}
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_360px]">
          <section className="space-y-6">
            <div className="rounded-2xl border border-border/50 bg-background/70 p-6 backdrop-blur-sm">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground md:text-4xl">{course.title}</h1>
                {!course.isFree && course.badge ? (
                  <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {course.badge}
                  </span>
                ) : null}
              </div>
              <p className="text-muted-foreground">{course.subtitle}</p>
              <p className="mt-2 text-sm text-muted-foreground/90">{course.description}</p>
            </div>

            <div className={`grid gap-4 ${course.isFree ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
              <div className="rounded-2xl border border-border/50 bg-background/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{text.totalUnits}</p>
                <p className="mt-2 text-2xl font-bold text-foreground">15</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-background/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{text.totalVideos}</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{course.totalVideos}</p>
              </div>
              {!course.isFree ? (
                <div className="rounded-2xl border border-border/50 bg-background/60 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{text.access}</p>
                  <p className="mt-2 text-2xl font-bold text-primary">{formatVndPrice(coursePrice)}</p>
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-border/50 bg-background/60 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{text.getStarted}</p>
              <h2 className="mt-2 text-2xl font-bold text-foreground">{text.startTitle}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {text.startDescription}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {canWatch && firstLecture ? (
                  <Link
                    href={`/courses/${course.slug}/${firstLecture}`}
                    className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    {text.watchFirst}
                  </Link>
                ) : (
                  <span className="rounded-xl border border-border/60 bg-muted/30 px-5 py-2.5 text-sm font-semibold text-muted-foreground">
                    {text.watchFirst}
                  </span>
                )}
                {canWatch && lastLecture ? (
                  <Link
                    href={`/courses/${course.slug}/${lastLecture}`}
                    className="rounded-xl border border-border/60 bg-muted/40 px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted/70"
                  >
                    {text.jumpLast}
                  </Link>
                ) : (
                  <span className="rounded-xl border border-border/60 bg-muted/30 px-5 py-2.5 text-sm font-semibold text-muted-foreground">
                    {text.jumpLast}
                  </span>
                )}
              </div>
              {!course.isFree && !accessLoading && !canWatch ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  {text.purchaseIntro}
                  <Link href="/courses" className="font-semibold text-primary underline-offset-2 hover:underline">
                    {text.purchaseLinkLabel}
                  </Link>
                  {formatCourseTemplate(text.purchaseOutro, { count: course.totalVideos })}
                </p>
              ) : null}
            </div>
          </section>

          <CourseOutlineSidebar
            courseId={course.slug}
            title={course.title}
            lectures={course.lectures}
            canAccessLectures={canWatch}
          />
        </div>
      </main>
    </div>
  );
}
