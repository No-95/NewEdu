'use client';

import React from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  DashboardBulletList,
  DashboardGrid,
  DashboardSection,
  DashboardStatGrid,
} from '@/components/dashboard/shared/DashboardPrimitives';

function useList(t: ReturnType<typeof useLanguage>['t'], key: string): string[] {
  const value = t(key, { returnObjects: true });
  return Array.isArray(value) ? value : [];
}

export function EmployerDashboard() {
  const { t } = useLanguage();

  return (
    <DashboardGrid>
      <DashboardSection title={t('dashboard.employer.recruitingOverviewTitle')} span={2} delay={0.05}>
        <DashboardStatGrid
          stats={[
            { label: t('dashboard.employer.activeJobs'), value: t('dashboard.employer.activeJobsValue'), accent: true },
            { label: t('dashboard.employer.newCandidates'), value: t('dashboard.employer.newCandidatesValue') },
            { label: t('dashboard.employer.interviews'), value: t('dashboard.employer.interviewsValue') },
            { label: t('dashboard.employer.hired'), value: t('dashboard.employer.hiredValue') },
          ]}
        />
      </DashboardSection>

      <DashboardSection title={t('dashboard.employer.recruitingMgmtTitle')} delay={0.1}>
        <DashboardBulletList items={useList(t, 'dashboard.employer.recruitingMgmt')} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.employer.talentPoolTitle')} delay={0.12}>
        <p className="mb-3 text-sm text-muted-foreground">{t('dashboard.employer.talentPoolSubtitle')}</p>
        <DashboardBulletList items={useList(t, 'dashboard.employer.talentPoolTags')} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.employer.trainingTitle')} delay={0.14}>
        <DashboardBulletList items={useList(t, 'dashboard.employer.training')} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.employer.matchingTitle')} delay={0.16}>
        <DashboardBulletList items={useList(t, 'dashboard.employer.matching')} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.employer.expertsTitle')} delay={0.18}>
        <DashboardBulletList items={useList(t, 'dashboard.employer.experts')} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.employer.reportsTitle')} delay={0.2}>
        <DashboardBulletList items={useList(t, 'dashboard.employer.reports')} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.employer.eventsTitle')} delay={0.22}>
        <DashboardBulletList items={useList(t, 'dashboard.employer.events')} />
      </DashboardSection>
    </DashboardGrid>
  );
}
