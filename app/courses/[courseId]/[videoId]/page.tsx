import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/ParticleBackground';
import { CourseOutlineSidebar } from '@/components/courses/CourseOutlineSidebar';
import { HlsVideoPlayer } from '@/components/courses/HlsVideoPlayer';
import { getCourseById, getLectureById } from '@/lib/data/courses';
import { parseVideoFolderName } from '@/lib/courses/outline';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function CourseVideoPage({
  params,
}: {
  params: Promise<{ courseId: string; videoId: string }>;
}) {
  const { courseId, videoId } = await params;
  const course = getCourseById(courseId);

  if (!course) {
    notFound();
  }

  const lecture = getLectureById(courseId, videoId);

  if (!lecture) {
    notFound();
  }

  const { unit, lecture: lectureNumber } = parseVideoFolderName(lecture.videoFolderName);

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      <Header />

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-24">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_360px]">
          <section className="space-y-6">
            <div className="space-y-2">
              <Link href={`/courses/${course.id}`} className="text-sm text-primary hover:underline">
                Quay lai danh sach video
              </Link>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-xs font-semibold text-muted-foreground">
                  Unit {unit}
                </span>
                <span className="rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-xs font-semibold text-muted-foreground">
                  Lecture {lectureNumber}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">{lecture.title}</h1>
              <p className="text-muted-foreground">{lecture.description}</p>
            </div>

            <HlsVideoPlayer courseId={course.id} videoId={lecture.id} title={lecture.title} />
          </section>

          <CourseOutlineSidebar course={course} activeVideoId={lecture.id} />
        </div>
      </main>
    </div>
  );
}
