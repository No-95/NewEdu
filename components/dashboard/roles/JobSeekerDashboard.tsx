'use client';

import React from 'react';
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
  DashboardProgressBar,
  DashboardSection,
  DashboardStatGrid,
} from '@/components/dashboard/shared/DashboardPrimitives';

export function JobSeekerDashboard({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const data = useQuery(api.dashboard.getJobSeekerDashboard, { email: userEmail });

  if (data === undefined) {
    return <DashboardLoadingState />;
  }

  return (
    <DashboardGrid>
      <DashboardSection title={t('dashboard.jobSeeker.profileTitle')} span={2} delay={0.05}>
        <DashboardProgressBar label={t('dashboard.jobSeeker.profileCompletion')} value={data.completionScore} />
        <div className="mt-6">
          <DashboardActionRow
            actions={[
              { label: t('dashboard.downloadCv'), href: '/career/profile', primary: true },
              { label: t('dashboard.updateProfile'), href: '/career/profile' },
            ]}
          />
        </div>
      </DashboardSection>

      <DashboardSection title={t('dashboard.jobSeeker.matchingJobsTitle')} delay={0.1} action={t('dashboard.viewAll')} actionHref="/jobs">
        <DashboardBulletList items={data.matchingJobs} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.jobSeeker.profileViewsTitle')} delay={0.12}>
        <DashboardStatGrid
          stats={[
            { label: t('dashboard.jobSeeker.recruiterViews'), value: data.recruiterViews },
            { label: t('dashboard.jobSeeker.interviewInvites'), value: data.interviewInvites, accent: true },
          ]}
        />
      </DashboardSection>

      <DashboardSection title={t('dashboard.jobSeeker.skillSuggestionsTitle')} delay={0.14} action={t('dashboard.viewAll')} actionHref="/career/ai-matching">
        <DashboardBulletList items={data.skillSuggestions} />
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
        <DashboardBulletList items={data.advisors} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.jobSeeker.careerEventsTitle')} delay={0.2} action={t('dashboard.viewAll')} actionHref="/events">
        <DashboardBulletList items={data.careerEvents} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.jobSeeker.networkTitle')} span={2} delay={0.22} action={t('dashboard.viewAll')} actionHref="/community">
        <DashboardChipList items={data.networkTags} />
      </DashboardSection>
    </DashboardGrid>
  );
}
