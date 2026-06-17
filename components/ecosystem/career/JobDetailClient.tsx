'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/context/LanguageContext';

export function JobDetailClient({ jobId, userEmail }: { jobId: string; userEmail?: string }) {
  const { t } = useLanguage();
  const job = useQuery(api.employerOps.getJobPostingByExternalId, { externalId: jobId });
  const isSaved = useQuery(
    api.employerOps.isJobSaved,
    userEmail && job
      ? { email: userEmail, jobPostingId: job.id as Id<'recruitmentJobPostings'> }
      : 'skip'
  );
  const applyToJob = useMutation(api.employerOps.applyToJob);
  const saveJob = useMutation(api.employerOps.saveJobPosting);
  const unsaveJob = useMutation(api.employerOps.unsaveJobPosting);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleToggleSave = async () => {
    if (!userEmail || !job) return;
    setSaving(true);
    setError('');
    try {
      if (isSaved) {
        await unsaveJob({
          email: userEmail,
          jobPostingId: job.id as Id<'recruitmentJobPostings'>,
        });
      } else {
        await saveJob({
          email: userEmail,
          jobPostingId: job.id as Id<'recruitmentJobPostings'>,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update saved job.');
    } finally {
      setSaving(false);
    }
  };

  const handleApply = async () => {
    if (!userEmail || !job) return;
    setApplying(true);
    setError('');
    try {
      await applyToJob({
        applicantEmail: userEmail,
        jobPostingId: job.id as Id<'recruitmentJobPostings'>,
      });
      setApplied(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not apply.');
    } finally {
      setApplying(false);
    }
  };

  if (job === undefined) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <ParticleBackground />
        <Header />
        <main className="relative z-10 px-6 pb-16 pt-24">
          <div className="mx-auto max-w-4xl text-center text-muted-foreground">{t('ecosystemPages.shared.loading')}</div>
        </main>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <ParticleBackground />
        <Header />
        <main className="relative z-10 px-6 pb-16 pt-24">
          <div className="mx-auto max-w-4xl">
            <div className="glass rounded-xl border border-border/50 p-8">
              <h1 className="mb-3 text-3xl font-bold">{t('ecosystemPages.careerJobs.jobNotFound')}</h1>
              <p className="mb-6 text-muted-foreground">{t('ecosystemPages.careerJobs.jobNotFoundBody')}</p>
              <Link href="/jobs" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
                {t('ecosystemPages.careerJobs.backToJobs')}
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

      <main className="relative z-10 px-6 pb-16 pt-24">
        <div className="mx-auto max-w-5xl">
          <article className="glass rounded-xl border border-border/50 p-8">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                {job.department}
              </span>
              {job.location ? (
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {job.location}
                </span>
              ) : null}
            </div>

            <h1 className="mb-2 text-3xl font-bold md:text-4xl">{job.title}</h1>
            <p className="mb-4 text-primary">{job.companyName}</p>
            {job.salary ? <p className="mb-4 text-sm text-muted-foreground">{job.salary}</p> : null}
            <p className="mb-6 text-muted-foreground">
              {job.description || t('ecosystemPages.careerJobs.noDescription')}
            </p>

            <div className="flex flex-wrap gap-3">
              {userEmail ? (
                applied ? (
                  <Button disabled className="bg-emerald-600 text-white">
                    {t('ecosystemPages.careerJobs.applied')}
                  </Button>
                ) : (
                  <Button onClick={handleApply} disabled={applying}>
                    {applying ? t('ecosystemPages.careerJobs.applying') : t('ecosystemPages.careerJobs.applyNow')}
                  </Button>
                )
              ) : (
                <Link
                  href={`/auth?mode=signin&redirect=/jobs/${jobId}`}
                  className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground"
                >
                  {t('ecosystemPages.careerJobs.signInToApply')}
                </Link>
              )}
              {userEmail ? (
                <Button variant="outline" onClick={handleToggleSave} disabled={saving || isSaved === undefined}>
                  {isSaved ? t('ecosystemPages.careerJobs.unsaveJob') : t('ecosystemPages.careerJobs.saveJob')}
                </Button>
              ) : null}
              <Link
                href="/jobs"
                className="rounded-lg border border-border/60 bg-muted px-6 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted/80"
              >
                {t('ecosystemPages.careerJobs.backToJobs')}
              </Link>
            </div>
            {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
          </article>
        </div>
      </main>
    </div>
  );
}
