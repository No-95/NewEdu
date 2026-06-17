'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  DashboardActionRow,
  DashboardBulletList,
  DashboardChipList,
  DashboardGrid,
  DashboardKeyValueList,
  DashboardLoadingState,
  DashboardNextStepCta,
  DashboardProgressBar,
  DashboardSection,
} from '@/components/dashboard/shared/DashboardPrimitives';

export function JobSeekerDashboard({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const data = useQuery(api.dashboard.getJobSeekerDashboard, { email: userEmail });

  if (data === undefined) {
    return <DashboardLoadingState />;
  }

  return (
    <>
      {data.nextStep ? (
        <DashboardNextStepCta labelKey={data.nextStep.labelKey} href={data.nextStep.href} />
      ) : null}
      <DashboardGrid>
      <DashboardSection title={t('dashboard.jobSeeker.profileTitle')} span={2} delay={0.05}>
        <DashboardProgressBar label={t('dashboard.jobSeeker.profileCompletion')} value={data.completionScore} />
        <div className="mt-6">
          <DashboardActionRow
            actions={[
              { label: t('dashboard.updateProfile'), href: '/career/profile', primary: true },
              { label: t('dashboard.downloadCv'), href: '/career/profile' },
            ]}
          />
        </div>
      </DashboardSection>

      <DashboardSection title={t('dashboard.jobSeeker.matchingJobsTitle')} delay={0.1} action={t('dashboard.viewAll')} actionHref="/jobs">
        {data.matchingJobs.length > 0 ? (
          <ul className="space-y-2">
            {data.matchingJobs.map((job) => (
              <li key={job.id}>
                <Link href={`/jobs/${job.externalId}`} className="text-sm text-primary hover:underline">
                  {job.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t('dashboard.jobSeeker.emptyMatchingJobs')}</p>
        )}
      </DashboardSection>

      <DashboardSection title={t('dashboard.jobSeeker.applicationsTitle')} delay={0.12} action={t('dashboard.viewAll')} actionHref="/career/applications">
        {data.recentApplications.length > 0 ? (
          <ul className="space-y-2">
            {data.recentApplications.map((a) => (
              <li key={a.id}>
                <Link href={`/career/applications/${a.id}`} className="text-sm text-primary hover:underline">
                  {a.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t('dashboard.jobSeeker.emptyApplications')}</p>
        )}
      </DashboardSection>

      {data.skillGaps.length > 0 ? (
        <DashboardSection title={t('dashboard.jobSeeker.skillGapsTitle')} delay={0.13}>
          <DashboardChipList items={data.skillGaps.map((s) => s.charAt(0).toUpperCase() + s.slice(1))} />
        </DashboardSection>
      ) : null}

      {data.savedJobs.length > 0 ? (
        <DashboardSection title={t('dashboard.jobSeeker.savedJobsTitle')} delay={0.135} action={t('dashboard.viewAll')} actionHref="/career/saved-jobs">
          <ul className="space-y-2">
            {data.savedJobs.map((job) => (
              <li key={job.id}>
                <Link href={`/jobs/${job.externalId}`} className="text-sm text-primary hover:underline">
                  {job.label}
                </Link>
              </li>
            ))}
          </ul>
        </DashboardSection>
      ) : null}

      <DashboardSection title={t('dashboard.jobSeeker.skillSuggestionsTitle')} delay={0.14} action={t('dashboard.viewAll')} actionHref="/career/ai-matching">
        {data.skillSuggestions.length > 0 ? (
          <DashboardBulletList items={data.skillSuggestions} />
        ) : (
          <p className="text-sm text-muted-foreground">{t('dashboard.jobSeeker.emptySkills')}</p>
        )}
      </DashboardSection>

      <DashboardSection title={t('dashboard.jobSeeker.careerPathTitle')} delay={0.16} action={t('dashboard.viewAll')} actionHref="/career/profile">
        <DashboardKeyValueList
          rows={[
            { label: t('dashboard.jobSeeker.currentRole'), value: data.currentRole },
            { label: t('dashboard.jobSeeker.targetRole'), value: data.targetRole },
          ]}
        />
      </DashboardSection>

      <DashboardSection title={t('dashboard.jobSeeker.advisorsTitle')} delay={0.18} action={t('dashboard.viewAll')} actionHref="/career/career-support">
        {data.careerSupport.length > 0 ? (
          <DashboardBulletList items={data.careerSupport.map((s) => s.label)} />
        ) : (
          <p className="text-sm text-muted-foreground">{t('dashboard.jobSeeker.emptyCareerSupport')}</p>
        )}
      </DashboardSection>

      <DashboardSection title={t('dashboard.jobSeeker.careerEventsTitle')} delay={0.2} action={t('dashboard.viewAll')} actionHref="/events">
        {data.careerEvents.length > 0 ? (
          <DashboardBulletList items={data.careerEvents} />
        ) : (
          <p className="text-sm text-muted-foreground">{t('dashboard.jobSeeker.emptyEvents')}</p>
        )}
      </DashboardSection>

      <DashboardSection title={t('dashboard.jobSeeker.networkTitle')} span={2} delay={0.22} action={t('dashboard.viewAll')} actionHref="/community">
        {data.networkTags.length > 0 ? (
          <DashboardChipList items={data.networkTags} />
        ) : (
          <p className="text-sm text-muted-foreground">{t('dashboard.jobSeeker.emptyNetwork')}</p>
        )}
      </DashboardSection>
    </DashboardGrid>
    </>
  );
}
