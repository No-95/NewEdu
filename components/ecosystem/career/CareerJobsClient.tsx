'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Building2,
  GraduationCap,
  MapPin,
  Search,
  Wallet,
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
import { ClientOnly } from '@/lib/hooks/useClientOnly';
import { useLanguage } from '@/lib/context/LanguageContext';

function matchesSearch(
  job: {
    title: string;
    companyName: string;
    department: string;
    location?: string;
    description?: string;
  },
  query: string
) {
  const haystack = [job.title, job.companyName, job.department, job.location ?? '', job.description ?? '']
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

function JobsPageContent() {
  const { t } = useLanguage();
  const ns = 'ecosystemPages.careerJobs';
  const [search, setSearch] = useState('');
  const jobs = useQuery(api.employerOps.listOpenJobPostings, {});

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = jobs ?? [];
    if (!query) return list;
    return list.filter((job) => matchesSearch(job, query));
  }, [jobs, search]);

  return (
    <div className="jobs-page min-h-screen bg-background">
      <ParticleBackground />
      <Header />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6">
        <section className="jobs-page-hero jobs-stagger-1 mb-8 md:mb-10">
          <div className="jobs-page-hero-orb" aria-hidden />
          <div className="relative z-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="home-eyebrow mb-4">{t(`${ns}.heroEyebrow`)}</p>
              <h1 className="home-title max-w-2xl text-4xl md:text-5xl lg:text-[3.25rem]">
                {t(`${ns}.title`)}
              </h1>
              <p className="home-subtitle mt-4 max-w-xl">{t(`${ns}.subtitle`)}</p>
            </div>
            <div className="jobs-count-pill shrink-0 self-start md:self-auto">
              <span className="jobs-count-pill-dot" aria-hidden />
              {t(`${ns}.jobsCount`, { params: { count: filteredJobs.length } })}
            </div>
          </div>
        </section>

        <section className="jobs-stagger-2 mb-8">
          <div className="home-card flex flex-col gap-4 border-primary/20 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
            <div className="flex items-start gap-3">
              <GraduationCap className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
              <div>
                <h2 className="text-lg font-bold text-foreground">{t(`${ns}.teacherApplyTitle`)}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t(`${ns}.teacherApplyBody`)}</p>
              </div>
            </div>
            <Link href="/teacher-applicant" className="jobs-apply-btn shrink-0 self-start sm:self-auto">
              {t(`${ns}.teacherApplyCta`)}
              <ArrowRight className="relative z-10 h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="jobs-stagger-2 mb-8">
          <label htmlFor="jobs-search" className="sr-only">
            {t(`${ns}.searchPlaceholder`)}
          </label>
          <div className="jobs-search-bar">
            <Search className="h-4 w-4 shrink-0 text-primary/70" />
            <input
              id="jobs-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t(`${ns}.searchPlaceholder`)}
              className="jobs-search-input"
            />
          </div>
        </section>

        {jobs === undefined ? (
          <div className="jobs-empty-state py-16 text-center text-sm text-muted-foreground">
            {t('ecosystemPages.shared.loading')}
          </div>
        ) : filteredJobs.length === 0 ? (
          <section className="jobs-stagger-3">
            <div className="jobs-empty-state">
              <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">
                {jobs.length === 0 ? t(`${ns}.emptyBoard`) : t(`${ns}.emptySearch`)}
              </p>
            </div>
          </section>
        ) : (
          filteredJobs.map((job) => (
            <section key={job.id} className="jobs-stagger-3 mb-8">
              <div className="home-card p-6 md:p-8">
                <Link href={`/jobs/${job.externalId}`} className="group block">
                  <h2 className="text-2xl font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary md:text-3xl">
                    {job.title}
                    <ArrowRight className="ml-2 inline-block h-5 w-5 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                  </h2>
                </Link>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="jobs-meta-chip">
                    <Building2 className="h-4 w-4 shrink-0 text-primary/80" />
                    {job.companyName}
                  </span>
                  {job.location ? (
                    <span className="jobs-meta-chip">
                      <MapPin className="h-4 w-4 shrink-0 text-primary/80" />
                      {job.location}
                    </span>
                  ) : null}
                  {job.salary ? (
                    <span className="jobs-meta-chip">
                      <Wallet className="h-4 w-4 shrink-0 text-primary/80" />
                      {job.salary}
                    </span>
                  ) : null}
                </div>

                <p className="mt-2 text-sm text-muted-foreground">{job.department}</p>
                {job.description ? (
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{job.description}</p>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={`/jobs/${job.externalId}`} className="jobs-apply-btn">
                    {t(`${ns}.actions.viewDetails`)}
                    <ArrowRight className="relative z-10 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
}

export function CareerJobsClient() {
  return (
    <ClientOnly>
      <JobsPageContent />
    </ClientOnly>
  );
}
