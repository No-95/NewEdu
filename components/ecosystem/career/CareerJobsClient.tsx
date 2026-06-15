'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  MapPin,
  Search,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
import { ClientOnly } from '@/lib/hooks/useClientOnly';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  TEACHER_REGISTRATION_APPLY_HREF,
  TEACHER_REGISTRATION_DETAIL_HREF,
  TEACHER_REGISTRATION_JOB_ID,
} from '@/lib/jobs/public-jobs';

type JobCard = {
  id: string;
  title: string;
  company: string;
  location: string;
  country: string;
  industry: string;
  salary: string;
  jobTypeLabel: string;
  requirements: string[];
  detailHref: string;
  applyHref: string;
};

function matchesSearch(job: JobCard, query: string) {
  const haystack = [
    job.title,
    job.company,
    job.location,
    job.country,
    job.industry,
    job.salary,
    job.jobTypeLabel,
    ...job.requirements,
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

function JobsPageContent() {
  const { t } = useLanguage();
  const ns = 'ecosystemPages.careerJobs';
  const jobKey = `${ns}.teacherListing`;
  const [search, setSearch] = useState('');

  const jobs = useMemo<JobCard[]>(() => {
    const reqs = t(`${jobKey}.requirements`, { returnObjects: true });
    const requirementList = Array.isArray(reqs) ? reqs : [];

    return [
      {
        id: TEACHER_REGISTRATION_JOB_ID,
        title: t(`${jobKey}.title`),
        company: t(`${jobKey}.company`),
        location: t(`${jobKey}.location`),
        country: t(`${jobKey}.country`),
        industry: t(`${jobKey}.industry`),
        salary: t(`${jobKey}.salary`),
        jobTypeLabel: t(`${jobKey}.jobTypeLabel`),
        requirements: requirementList,
        detailHref: TEACHER_REGISTRATION_DETAIL_HREF,
        applyHref: TEACHER_REGISTRATION_APPLY_HREF,
      },
    ];
  }, [t, jobKey]);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return jobs;
    return jobs.filter((job) => matchesSearch(job, query));
  }, [jobs, search]);

  return (
    <div className="jobs-page min-h-screen bg-background">
      <ParticleBackground />
      <Header />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6">
        {/* Hero */}
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

        {/* Search */}
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

        {/* Listings */}
        {filteredJobs.length === 0 ? (
          <section className="jobs-stagger-3">
            <div className="jobs-empty-state">
              <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">{t(`${ns}.emptySearch`)}</p>
            </div>
          </section>
        ) : (
          filteredJobs.map((job) => (
            <section key={job.id} className="jobs-stagger-3 mb-12">
              <div className="jobs-spotlight">
                <div className="grid gap-0 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px]">
                  <div className="p-7 md:p-10 lg:border-r lg:border-border">
                    <span className="jobs-featured-badge mb-5">
                      <Sparkles className="h-3.5 w-3.5" />
                      {t(`${ns}.featuredBadge`)}
                    </span>

                    <Link href={job.detailHref} className="group block">
                      <h2 className="text-2xl font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary md:text-3xl lg:text-[2rem]">
                        {job.title}
                        <ArrowRight className="ml-2 inline-block h-5 w-5 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 md:h-6 md:w-6" />
                      </h2>
                    </Link>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="jobs-meta-chip">
                        <Building2 className="h-4 w-4 shrink-0 text-primary/80" />
                        {job.company}
                      </span>
                      <span className="jobs-meta-chip">
                        <MapPin className="h-4 w-4 shrink-0 text-primary/80" />
                        {job.location}
                      </span>
                      <span className="jobs-meta-chip">
                        <Wallet className="h-4 w-4 shrink-0 text-primary/80" />
                        {job.salary}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="jobs-tag-accent">{job.jobTypeLabel}</span>
                      <span className="jobs-tag">{job.industry}</span>
                      <span className="jobs-tag">{job.country}</span>
                    </div>

                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                      {job.requirements.map((req, index) => (
                        <div
                          key={req}
                          className="jobs-req-card"
                          style={{ animationDelay: `${index * 80}ms` }}
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span className="text-sm leading-relaxed text-muted-foreground">{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center border-t border-border p-7 md:p-8 lg:border-t-0">
                    <div className="jobs-cta-panel">
                      <div className="jobs-revenue-ring mb-5">
                        <div>
                          <p className="text-4xl font-black tracking-tight text-primary">
                            {t(`${ns}.revenueStat`)}
                          </p>
                          <p className="mt-1 max-w-[7rem] text-[10px] font-semibold uppercase leading-tight tracking-wider text-muted-foreground">
                            {t(`${ns}.revenueStatLabel`)}
                          </p>
                        </div>
                      </div>

                      <Link href={job.applyHref} className="jobs-apply-btn">
                        {t(`${ns}.actions.apply`)}
                        <ArrowRight className="relative z-10 h-4 w-4" />
                      </Link>

                      <Link
                        href={job.detailHref}
                        className="mt-4 text-xs font-medium text-primary/80 transition-colors hover:text-primary"
                      >
                        {t(`${ns}.actions.viewDetails`)} →
                      </Link>

                      <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground/80">
                        {t(`${ns}.ctaNote`)}
                      </p>
                    </div>
                  </div>
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
