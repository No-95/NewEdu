import Link from 'next/link';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';

type JobPageProps = {
  params: Promise<{ jobID: string }>;
};

const JOB_DETAILS: Record<string, { title: string; summary: string; bullets: string[] }> = {
  'start-teaching-now': {
    title: 'Start Teaching Now with us',
    summary:
      'This is a remote teaching opportunity designed for independent educators who want schedule flexibility and high income share.',
    bullets: [
      'Work mode: Fully remote',
      'Working hour: Flexible (you choose your slots)',
      'Teacher income share: 92%',
      'Platform share: 8%',
      'Primary mission: Deliver practical, learner-focused lessons',
      'Best fit for: Korean language educators and subject mentors',
    ],
  },
};

export default async function JobDetailPage({ params }: JobPageProps) {
  const { jobID } = await params;
  const job = JOB_DETAILS[jobID];

  if (!job) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <ParticleBackground />
        <Header />
        <main className="relative z-10 pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-6">
            <div className="glass rounded-xl border border-border/50 p-8">
              <h1 className="text-3xl font-bold mb-3">Job not found</h1>
              <p className="text-muted-foreground mb-6">The requested job listing does not exist.</p>
              <Link href="/jobs" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                Back to Jobs
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ParticleBackground />
      <Header />

      <main className="relative z-10 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          <article className="glass rounded-xl border border-border/50 p-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">Remote Job</span>
              <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold">Flexible Working Hour</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">{job.title}</h1>
            <p className="text-muted-foreground mb-6">{job.summary}</p>

            <div className="rounded-lg bg-muted/30 border border-border/50 p-5 mb-6">
              <h2 className="text-lg font-semibold mb-3">Job Details</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {job.bullets.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/teacher-applicant"
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:shadow-glow-cyan transition-all text-sm font-medium"
              >
                Apply Now
              </Link>
              <Link
                href="/jobs"
                className="px-6 py-2.5 bg-muted text-foreground rounded-lg border border-border/60 hover:bg-muted/80 transition-all text-sm font-medium"
              >
                Back to Jobs
              </Link>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
