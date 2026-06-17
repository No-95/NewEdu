'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  DashboardBulletList,
  DashboardGrid,
  DashboardKeyValueList,
  DashboardLinkList,
  DashboardLoadingState,
  DashboardNextStepCta,
  DashboardSection,
  DashboardStatGrid,
} from '@/components/dashboard/shared/DashboardPrimitives';

export function EmployerDashboard({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const data = useQuery(api.dashboard.getEmployerDashboard, { email: userEmail });

  if (data === undefined) {
    return <DashboardLoadingState />;
  }

  return (
    <>
      {data.nextStep ? (
        <DashboardNextStepCta labelKey={data.nextStep.labelKey} href={data.nextStep.href} />
      ) : null}
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

      <DashboardSection title={t('dashboard.employer.openJobsTitle')} delay={0.08} action={t('dashboard.viewAll')} actionHref="/business/recruitment">
        {data.openJobSummaries.length > 0 ? (
          <DashboardLinkList
            items={data.openJobSummaries.map((job) => ({
              label: job.label,
              href: job.href,
            }))}
          />
        ) : (
          <p className="text-sm text-muted-foreground">{t('dashboard.employer.emptyOpenJobs')}</p>
        )}
      </DashboardSection>

      <DashboardSection title={t('dashboard.employer.pipelineTitle')} delay={0.1} action={t('dashboard.viewAll')} actionHref="/business/recruitment">
        <DashboardKeyValueList
          rows={[
            { label: t('ecosystemPages.shared.recruitmentStages.applied'), value: String(data.pipelineCounts.applied) },
            { label: t('ecosystemPages.shared.recruitmentStages.screening'), value: String(data.pipelineCounts.screening) },
            { label: t('ecosystemPages.shared.recruitmentStages.interview'), value: String(data.pipelineCounts.interview) },
            { label: t('ecosystemPages.shared.recruitmentStages.offer'), value: String(data.pipelineCounts.offer) },
          ]}
        />
      </DashboardSection>

      <DashboardSection title={t('dashboard.employer.topCandidatesTitle')} delay={0.12} action={t('dashboard.viewAll')} actionHref="/business/recruitment">
        {data.topCandidates.length > 0 ? (
          <DashboardLinkList
            items={data.topCandidates.map((c) => ({
              label: c.label,
              href: c.href,
            }))}
          />
        ) : (
          <p className="text-sm text-muted-foreground">{t('dashboard.employer.emptyCandidates')}</p>
        )}
      </DashboardSection>

      <DashboardSection title={t('dashboard.employer.trainingTitle')} delay={0.14} action={t('dashboard.viewAll')} actionHref="/business/internal-training">
        {data.trainingItems.length > 0 ? (
          <DashboardBulletList items={data.trainingItems.map((item) => item.label)} />
        ) : (
          <p className="text-sm text-muted-foreground">{t('dashboard.employer.emptyTraining')}</p>
        )}
      </DashboardSection>

      <DashboardSection title={t('dashboard.employer.hrTitle')} delay={0.16} action={t('dashboard.viewAll')} actionHref="/business/hr-management">
        <DashboardLinkList
          items={[
            { label: t('dashboard.employer.hrEmployees'), href: '/business/hr-management' },
            { label: t('dashboard.employer.hrDepartments'), href: '/business/hr-management' },
          ]}
        />
      </DashboardSection>
    </DashboardGrid>
    </>
  );
}
