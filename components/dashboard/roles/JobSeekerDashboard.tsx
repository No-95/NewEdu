'use client';

import React from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  DashboardActionRow,
  DashboardBulletList,
  DashboardChipList,
  DashboardGrid,
  DashboardKeyValueList,
  DashboardProgressBar,
  DashboardSection,
  DashboardStatGrid,
} from '@/components/dashboard/shared/DashboardPrimitives';

function useList(t: ReturnType<typeof useLanguage>['t'], key: string): string[] {
  const value = t(key, { returnObjects: true });
  return Array.isArray(value) ? value : [];
}

export function JobSeekerDashboard() {
  const { t } = useLanguage();

  return (
    <DashboardGrid>
      <DashboardSection title={t('dashboard.jobSeeker.profileTitle')} span={2} delay={0.05}>
        <DashboardProgressBar label={t('dashboard.jobSeeker.profileCompletion')} value={85} />
        <div className="mt-6">
          <DashboardActionRow
            actions={[
              { label: t('dashboard.downloadCv'), href: '/dashboard', primary: true },
              { label: t('dashboard.updateProfile'), href: '/dashboard' },
            ]}
          />
        </div>
      </DashboardSection>

      <DashboardSection title={t('dashboard.jobSeeker.matchingJobsTitle')} delay={0.1}>
        <DashboardBulletList items={useList(t, 'dashboard.jobSeeker.matchingJobs')} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.jobSeeker.profileViewsTitle')} delay={0.12}>
        <DashboardStatGrid
          stats={[
            { label: t('dashboard.jobSeeker.recruiterViews'), value: t('dashboard.jobSeeker.recruiterViewsValue') },
            { label: t('dashboard.jobSeeker.interviewInvites'), value: t('dashboard.jobSeeker.interviewInvitesValue'), accent: true },
          ]}
        />
      </DashboardSection>

      <DashboardSection title={t('dashboard.jobSeeker.skillSuggestionsTitle')} delay={0.14}>
        <DashboardBulletList items={useList(t, 'dashboard.jobSeeker.skillSuggestions')} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.jobSeeker.careerPathTitle')} delay={0.16}>
        <DashboardKeyValueList
          rows={[
            { label: t('dashboard.jobSeeker.currentRole'), value: t('dashboard.jobSeeker.currentRoleValue') },
            { label: t('dashboard.jobSeeker.targetRole'), value: t('dashboard.jobSeeker.targetRoleValue') },
          ]}
        />
      </DashboardSection>

      <DashboardSection title={t('dashboard.jobSeeker.advisorsTitle')} delay={0.18}>
        <DashboardBulletList items={useList(t, 'dashboard.jobSeeker.advisors')} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.jobSeeker.careerEventsTitle')} delay={0.2}>
        <DashboardBulletList items={useList(t, 'dashboard.jobSeeker.careerEvents')} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.jobSeeker.networkTitle')} span={2} delay={0.22}>
        <DashboardChipList items={useList(t, 'dashboard.jobSeeker.networkTags')} />
      </DashboardSection>
    </DashboardGrid>
  );
}
