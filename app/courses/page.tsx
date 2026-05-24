import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/ParticleBackground';
import { courses } from '@/lib/data/courses';
import Link from 'next/link';

export default function CoursesPage() {
  const [course] = courses;

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      <Header />

      <main className="relative z-10 mx-auto max-w-5xl px-6 pb-16 pt-24">
        <div className="mb-10 space-y-3">
          <h1 className="text-4xl font-bold text-foreground md:text-5xl">Khoa hoc</h1>
          <p className="max-w-3xl text-muted-foreground">Chon khoa hoc de bat dau hoc theo tung video.</p>
        </div>

        <Link
          href={`/courses/${course.id}`}
          className="group block rounded-2xl border border-border/50 bg-background/70 p-6 transition-all hover:border-primary/60 hover:shadow-glow-cyan"
        >
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold text-foreground group-hover:text-primary">{course.title}</h2>
            <span className="rounded-full border border-emerald-300/40 bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
              100% FREE
            </span>
          </div>

          <p className="text-muted-foreground">{course.subtitle}</p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>72 videos san sang</span>
            <span>Cloudflare R2 HLS streaming</span>
          </div>
        </Link>
      </main>
    </div>
  );
}
