import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/ParticleBackground';
import { CourseOutlineSidebar } from '@/components/courses/CourseOutlineSidebar';
import { getCourseById } from '@/lib/data/courses';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = getCourseById(courseId);

  if (!course) {
    notFound();
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
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total units</p>
                <p className="mt-2 text-2xl font-bold text-foreground">15</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-background/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total videos</p>
                <p className="mt-2 text-2xl font-bold text-foreground">72</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-background/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Access</p>
                <p className="mt-2 text-2xl font-bold text-emerald-300">Free</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-background/60 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Get started</p>
              <h2 className="mt-2 text-2xl font-bold text-foreground">Bắt đầu từ Unit 1, Lecture 1</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Outline bên phải được nhóm tự động theo Unit và sắp xếp bằng số thực, nên Unit 2 luôn đứng trước Unit 10.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/courses/${course.id}/${course.lectures[0]?.id}`}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Watch first lecture
                </Link>
                <Link
                  href={`/courses/${course.id}/${course.lectures[course.lectures.length - 1]?.id}`}
                  className="rounded-xl border border-border/60 bg-muted/40 px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted/70"
                >
                  Jump to last lecture
                </Link>
              </div>
            </div>
          </section>

          <CourseOutlineSidebar course={course} />
        </div>
      </main>
    </div>
  );
}
