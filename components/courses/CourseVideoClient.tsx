'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import { useQuery } from 'convex/react';

import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
import { CourseOutlineSidebar } from '@/components/courses/CourseOutlineSidebar';
import CourseAction from '@/components/courses/CourseAction';
import { HlsVideoPlayer } from '@/components/courses/HlsVideoPlayer';
import { api } from '@/convex/_generated/api';
import { useCourseAccess } from '@/hooks/useCourseAccess';
import { useLanguage } from '@/lib/context/LanguageContext';
import { COURSE_TEXT, LECTURE_TITLES, UNIT_TITLES, getCourseLanguage } from '@/lib/courses/localization';
import { compareVideoFolderNames, parseVideoFolderName } from '@/lib/courses/outline';
import { formatVndPrice } from '@/lib/currency';

interface CourseVideoClientProps {
  courseSlug: string;
  videoId: string;
}

export function CourseVideoClient({ courseSlug, videoId }: CourseVideoClientProps) {
  const { language } = useLanguage();
  const locale = getCourseLanguage(language);
  const text = COURSE_TEXT[locale].video;
  const result = useQuery(api.courses.getLectureByCourseAndVideoId, {
    slug: courseSlug,
    videoId,
  });
  const course = useQuery(api.courses.getCourseBySlug, { slug: courseSlug });
  const isFree = course?.isFree ?? result?.course.isFree ?? false;
  const price = course?.price ?? 2_000;
  const { loading: accessLoading, hasAccess } = useCourseAccess(courseSlug, isFree);
  const canWatch = isFree || hasAccess;

  if (!result) {
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

  const { course: videoCourse, lecture } = result;
  const { unit, lecture: lectureNumber } = parseVideoFolderName(lecture.videoFolderName);
  const orderedLectures = [...(course?.lectures ?? [])].sort((left, right) =>
    compareVideoFolderNames(left.videoFolderName, right.videoFolderName)
  );
  const currentLectureIndex = orderedLectures.findIndex(
    (item) => item.videoFolderName === lecture.videoFolderName
  );
  const previousLecture = currentLectureIndex > 0 ? orderedLectures[currentLectureIndex - 1] : null;
  const nextLecture =
    currentLectureIndex >= 0 && currentLectureIndex < orderedLectures.length - 1
      ? orderedLectures[currentLectureIndex + 1]
      : null;
  const unitTitle = UNIT_TITLES[locale][unit] ?? `${text.unitLabel} ${unit}`;
  const lectureTypeTitle = LECTURE_TITLES[locale][lectureNumber] ?? `${text.lectureLabel} ${lectureNumber}`;

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      <Header />

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-24">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_360px]">
          <section className="space-y-6">
            <div className="rounded-2xl border border-border/60 bg-background/75 p-6 shadow-[0_18px_40px_-28px_rgba(8,145,178,0.85)] backdrop-blur-sm md:p-7">
              <div className="mb-3 flex items-center justify-between gap-4">
                <Link
                  href={`/courses/${videoCourse.slug}`}
                  className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  {text.backToCourse}
                </Link>
                <span className="rounded-full border border-emerald-300/40 bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                  {text.hlsStreaming}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {text.unitLabel} {unit}
                </span>
                <span className="rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {text.lectureLabel} {lectureNumber}
                </span>
                <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {lectureTypeTitle}
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-bold leading-tight text-foreground md:text-3xl">{unitTitle}</h1>
              <h2 className="mt-1 text-lg font-semibold text-foreground/90">{lectureTypeTitle}</h2>

              <p className="mt-3 text-sm text-muted-foreground">
                {lecture.description || text.descriptionFallback}
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border/50 bg-background/60 p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{text.course}</p>
                  <p className="mt-1 line-clamp-1 text-sm font-semibold text-foreground">{videoCourse.title}</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-background/60 p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{text.currentId}</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{lecture.videoFolderName}</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-background/60 p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{text.position}</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {currentLectureIndex >= 0 ? currentLectureIndex + 1 : 1}/{orderedLectures.length || 1}
                  </p>
                </div>
              </div>
            </div>

            {!accessLoading && !canWatch ? (
              <div className="rounded-2xl border border-border/60 bg-background/75 p-8 text-center">
                <Lock className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-bold text-foreground">Purchase required</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Unlock this course for {formatVndPrice(price)} to watch all video lessons.
                </p>
                <div className="mt-6 flex justify-center">
                  <CourseAction courseSlug={videoCourse.slug} isFree={false} price={price} />
                </div>
              </div>
            ) : (
              <HlsVideoPlayer courseId={videoCourse.slug} videoId={lecture.videoFolderName} title={lecture.title} />
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {previousLecture && canWatch ? (
                <Link
                  href={`/courses/${videoCourse.slug}/${previousLecture.videoFolderName}`}
                  className="rounded-xl border border-border/60 bg-background/70 p-4 transition hover:border-primary/60 hover:bg-muted/40"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{text.previousLecture}</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{previousLecture.videoFolderName}</p>
                </Link>
              ) : (
                <div className="rounded-xl border border-border/40 bg-background/50 p-4 text-sm text-muted-foreground">
                  {text.firstLessonMessage}
                </div>
              )}

              {nextLecture && canWatch ? (
                <Link
                  href={`/courses/${videoCourse.slug}/${nextLecture.videoFolderName}`}
                  className="rounded-xl border border-border/60 bg-background/70 p-4 transition hover:border-primary/60 hover:bg-muted/40"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{text.nextLecture}</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{nextLecture.videoFolderName}</p>
                </Link>
              ) : (
                <div className="rounded-xl border border-border/40 bg-background/50 p-4 text-sm text-muted-foreground">
                  {text.lastLessonMessage}
                </div>
              )}
            </div>
          </section>

          <CourseOutlineSidebar
            courseId={videoCourse.slug}
            title={course?.title || videoCourse.title}
            lectures={course?.lectures || []}
            activeVideoId={lecture.videoFolderName}
            canAccessLectures={canWatch}
          />
        </div>
      </main>
    </div>
  );
}
