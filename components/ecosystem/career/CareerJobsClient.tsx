'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  Clock,
  GraduationCap,
  MapPin,
  PlusCircle,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
import { ClientOnly } from '@/lib/hooks/useClientOnly';
import { useLanguage } from '@/lib/context/LanguageContext';
import { CreateJobPostingDialog } from '@/components/ecosystem/business/EmployerOpsDialogs';
import { TEACHER_REGISTRATION_JOB_ID } from '@/lib/jobs/public-jobs';

type JobRow = {
  id: string;
  externalId: string;
  title: string;
  department: string;
  location?: string;
  description?: string;
  salary?: string;
  companyName: string;
  postedAt: string;
  applicants: number;
};

function matchesSearch(job: JobRow, query: string) {
  const haystack = [job.title, job.companyName, job.department, job.location ?? '', job.description ?? '']
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

function companyInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'H';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatPostedDate(value: string) {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isTeacherListing(job: JobRow) {
  if (job.externalId === TEACHER_REGISTRATION_JOB_ID) return true;
  const title = job.title.toLowerCase();
  return (
    title.includes('teach') ||
    title.includes('giảng dạy') ||
    title.includes('giang day') ||
    title.includes('강의') ||
    title.includes('강사')
  );
}

function JobListingCard({
  job,
  featured,
  ns,
  t,
}: {
  job: JobRow;
  featured?: boolean;
  ns: string;
  t: (key: string, options?: { params?: Record<string, string | number> }) => string;
}) {
  const teacher = isTeacherListing(job);

  return (
    <article className={`jobs-listing-card group ${teacher ? 'jobs-listing-card--teacher' : ''}`}>
      <div className="jobs-listing-card-accent" aria-hidden />

      <div className="flex items-start justify-between gap-3">
        <div className={`jobs-listing-avatar ${teacher ? 'jobs-listing-avatar--teacher' : ''}`}>
          {teacher ? <GraduationCap className="h-5 w-5" /> : companyInitials(job.companyName)}
        </div>
        {featured ? (
          <span className="jobs-featured-badge shrink-0">
            <Sparkles className="h-3 w-3" />
            {t(`${ns}.featuredBadge`)}
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <Link href={`/jobs/${job.externalId}`} className="block">
          <h2 className="text-lg font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary md:text-xl">
            {job.title}
          </h2>
        </Link>
        <p className="mt-1 text-sm font-medium text-muted-foreground">{job.companyName}</p>
        <p className="mt-0.5 text-xs text-muted-foreground/80">{job.department}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {job.location ? (
          <span className="jobs-meta-chip text-xs">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/80" />
            {job.location}
          </span>
        ) : null}
        {job.salary ? (
          <span className="jobs-meta-chip text-xs">
            <Wallet className="h-3.5 w-3.5 shrink-0 text-primary/80" />
            {job.salary}
          </span>
        ) : null}
        {job.applicants > 0 ? (
          <span className="jobs-meta-chip text-xs">
            <Users className="h-3.5 w-3.5 shrink-0 text-primary/80" />
            {t(`${ns}.applicantsCount`, { params: { count: job.applicants } })}
          </span>
        ) : null}
      </div>

      {job.description ? (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{job.description}</p>
      ) : null}

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {t(`${ns}.postedOn`, { params: { date: formatPostedDate(job.postedAt) } })}
        </span>
        <Link
          href={`/jobs/${job.externalId}`}
          className="jobs-listing-link inline-flex items-center gap-1 text-sm font-semibold text-primary"
        >
          {t(`${ns}.actions.viewDetails`)}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}

function JobsPageContent({ userEmail }: { userEmail: string | null }) {
  const { t } = useLanguage();
  const router = useRouter();
  const ns = 'ecosystemPages.careerJobs';
  const [search, setSearch] = useState('');
  const [postJobOpen, setPostJobOpen] = useState(false);
  const jobs = useQuery(api.employerOps.listOpenJobPostings, {});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('postJob') === '1' && userEmail) {
      setPostJobOpen(true);
    }
  }, [userEmail]);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = (jobs ?? []) as JobRow[];
    if (!query) return list;
    return list.filter((job) => matchesSearch(job, query));
  }, [jobs, search]);

  const hasTeacherListing = (jobs ?? []).some((job) => isTeacherListing(job as JobRow));
  const showTeacherSidebar = !hasTeacherListing;

  const postJobHref = userEmail
    ? undefined
    : `/auth?mode=signin&redirect=${encodeURIComponent('/jobs?postJob=1')}`;

  return (
    <div className="jobs-page min-h-screen bg-background">
      <ParticleBackground />
      <Header />

      {userEmail ? (
        <CreateJobPostingDialog
          userEmail={userEmail}
          open={postJobOpen}
          onOpenChange={setPostJobOpen}
          onCreated={(externalId) => router.push(`/jobs/${externalId}`)}
        />
      ) : null}

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6">
        <section className="jobs-page-hero jobs-stagger-1 mb-10 md:mb-12">
          <div className="jobs-page-hero-orb" aria-hidden />
          <div className="relative z-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="home-eyebrow mb-4">{t(`${ns}.heroEyebrow`)}</p>
              <h1 className="home-title max-w-2xl text-4xl md:text-5xl lg:text-[3.25rem]">{t(`${ns}.title`)}</h1>
              <p className="home-subtitle mt-4 max-w-xl">{t(`${ns}.subtitle`)}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {userEmail ? (
                  <button type="button" onClick={() => setPostJobOpen(true)} className="jobs-sidebar-cta">
                    <PlusCircle className="h-4 w-4" />
                    {t(`${ns}.postJob`)}
                  </button>
                ) : (
                  <Link href={postJobHref!} className="jobs-sidebar-cta">
                    <PlusCircle className="h-4 w-4" />
                    {t(`${ns}.signInToPost`)}
                  </Link>
                )}
              </div>
            </div>
            <div className="jobs-count-pill shrink-0 self-start md:self-auto">
              <span className="jobs-count-pill-dot" aria-hidden />
              {t(`${ns}.jobsCount`, { params: { count: filteredJobs.length } })}
            </div>
          </div>
        </section>

        <div className="jobs-board-layout jobs-stagger-2">
          <div className="jobs-board-main min-w-0">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">{t(`${ns}.openRolesTitle`)}</h2>
              </div>
              <label htmlFor="jobs-search" className="sr-only">
                {t(`${ns}.searchPlaceholder`)}
              </label>
              <div className="jobs-search-bar w-full sm:max-w-md">
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
            </div>

            {jobs === undefined ? (
              <div className="jobs-empty-state py-16 text-center text-sm text-muted-foreground">
                {t('ecosystemPages.shared.loading')}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="jobs-empty-state">
                <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground">
                  {(jobs as JobRow[]).length === 0 ? t(`${ns}.emptyBoard`) : t(`${ns}.emptySearch`)}
                </p>
              </div>
            ) : (
              <div
                className={`jobs-board-grid ${filteredJobs.length === 1 ? 'jobs-board-grid--single' : ''}`}
              >
                {filteredJobs.map((job, index) => (
                  <JobListingCard
                    key={job.id}
                    job={job as JobRow}
                    featured={index === 0 && filteredJobs.length <= 3}
                    ns={ns}
                    t={t}
                  />
                ))}
              </div>
            )}
          </div>

          <aside className="jobs-board-aside">
            <div className="jobs-sidebar-card jobs-sidebar-card--accent">
              <div className="jobs-sidebar-card-glow" aria-hidden />
              <PlusCircle className="h-6 w-6 text-primary" />
              <h3 className="mt-3 text-base font-bold text-foreground">{t(`${ns}.postJob`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(`${ns}.postJobBody`)}</p>
              {userEmail ? (
                <>
                  <button type="button" onClick={() => setPostJobOpen(true)} className="jobs-sidebar-cta mt-5">
                    {t(`${ns}.postJob`)}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <Link href="/business/recruitment" className="jobs-sidebar-link mt-3">
                    {t(`${ns}.manageMyJobs`)}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </>
              ) : (
                <Link href={postJobHref!} className="jobs-sidebar-cta mt-5">
                  {t(`${ns}.signInToPost`)}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>

            {showTeacherSidebar ? (
              <div className="jobs-sidebar-card jobs-sidebar-card--accent">
                <div className="jobs-sidebar-card-glow" aria-hidden />
                <GraduationCap className="h-6 w-6 text-primary" />
                <h3 className="mt-3 text-base font-bold text-foreground">{t(`${ns}.teacherApplyTitle`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`${ns}.teacherApplyBody`)}
                </p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">{t(`${ns}.revenueStat`)}</span>
                  <span className="text-xs text-muted-foreground">{t(`${ns}.revenueStatLabel`)}</span>
                </div>
                <Link href="/teacher-applicant" className="jobs-sidebar-cta mt-5">
                  {t(`${ns}.teacherApplyCta`)}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="mt-3 text-[11px] text-muted-foreground/80">{t(`${ns}.ctaNote`)}</p>
              </div>
            ) : (
              <div className="jobs-sidebar-card">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="mt-3 text-base font-bold text-foreground">{t(`${ns}.sidebarGrowTitle`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`${ns}.sidebarGrowBody`)}
                </p>
              </div>
            )}

            <div className="jobs-sidebar-card">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="mt-3 text-sm font-bold text-foreground">{t(`${ns}.sidebarProfileTitle`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`${ns}.sidebarProfileBody`)}
              </p>
              <Link href="/career/profile" className="jobs-sidebar-link mt-4">
                {t(`${ns}.sidebarProfileCta`)}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export function CareerJobsClient({ userEmail }: { userEmail: string | null }) {
  return (
    <ClientOnly>
      <JobsPageContent userEmail={userEmail} />
    </ClientOnly>
  );
}
