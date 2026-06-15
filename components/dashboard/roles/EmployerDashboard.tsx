'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  DashboardBulletList,
  DashboardChipList,
  DashboardGrid,
  DashboardLinkList,
  DashboardLoadingState,
  DashboardSection,
  DashboardStatGrid,
} from '@/components/dashboard/shared/DashboardPrimitives';

function useLinkSection(t: ReturnType<typeof useLanguage>['t'], labelKey: string, hrefs: string[]) {
  const labels = t(labelKey, { returnObjects: true });
  const labelList = Array.isArray(labels) ? labels : [];
  return labelList.map((label, index) => ({
    label,
    href: hrefs[index] ?? '/dashboard',
  }));
}

export function EmployerDashboard({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const data = useQuery(api.dashboard.getEmployerDashboard, { email: userEmail });

  if (data === undefined) {
    return <DashboardLoadingState />;
  }

  return (
    <DashboardGrid>
      <DashboardSection title={t('dashboard.employer.recruitingOverviewTitle')} span={2} delay={0.05}>
        <DashboardStatGrid
          stats={[
            { label: t('dashboard.employer.activeJobs'), value: data.stats.activeJobs, accent: true },
            { label: t('dashboard.employer.newCandidates'), value: data.stats.newCandidates },
            { label: t('dashboard.employer.interviews'), value: data.stats.interviews },
            { label: t('dashboard.employer.hired'), value: data.stats.hired },
          ]}
        />
      </DashboardSection>

      <DashboardSection title={t('dashboard.employer.recruitingMgmtTitle')} delay={0.1}>
        <DashboardLinkList
          items={useLinkSection(t, 'dashboard.employer.recruitingMgmt', [
            '/business/recruitment',
            '/business/recruitment',
            '/contact-us',
          ])}
        />
      </DashboardSection>

      <DashboardSection title={t('dashboard.employer.talentPoolTitle')} delay={0.12} action={t('dashboard.viewAll')} actionHref="/business/recruitment">
        <p className="mb-3 text-sm text-muted-foreground">{t('dashboard.employer.talentPoolSubtitle')}</p>
        <DashboardChipList items={data.talentPoolTags} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.employer.trainingTitle')} delay={0.14} action={t('dashboard.viewAll')} actionHref="/business/internal-training">
        <DashboardBulletList items={data.trainingItems.length > 0 ? data.trainingItems : data.employeeProgress} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.employer.matchingTitle')} delay={0.16} action={t('dashboard.viewAll')} actionHref="/business/recruitment">
        <DashboardBulletList items={data.matchingItems} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.employer.expertsTitle')} delay={0.18}>
        <DashboardLinkList
          items={useLinkSection(t, 'dashboard.employer.experts', [
            '/experts/network',
            '/career/career-support',
            '/contact-us',
          ])}
        />
      </DashboardSection>

      <DashboardSection title={t('dashboard.employer.reportsTitle')} delay={0.2}>
        <DashboardLinkList
          items={useLinkSection(t, 'dashboard.employer.reports', [
            '/business/hr-management',
            '/business/internal-training',
            '/business/recruitment',
          ])}
        />
      </DashboardSection>

      <DashboardSection title={t('dashboard.employer.eventsTitle')} delay={0.22} action={t('dashboard.viewAll')} actionHref="/events">
        <DashboardBulletList items={data.events} />
      </DashboardSection>
    </DashboardGrid>
  );
}
