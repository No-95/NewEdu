'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  DashboardBulletList,
  DashboardGrid,
  DashboardIncomeRow,
  DashboardKeyValueList,
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

export function ExpertDashboard({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const data = useQuery(api.dashboard.getExpertDashboard, { email: userEmail });

  if (data === undefined) {
    return <DashboardLoadingState />;
  }

  return (
    <DashboardGrid>
      <DashboardSection title={t('dashboard.expert.profileTitle')} span={2} delay={0.05}>
        <DashboardKeyValueList
          rows={[
            { label: t('dashboard.expert.credibility'), value: data.credibility },
            { label: t('dashboard.expert.followers'), value: data.followers },
          ]}
        />
      </DashboardSection>

      <DashboardSection title={t('dashboard.expert.activityTitle')} delay={0.1} action={t('dashboard.viewAll')} actionHref="/community">
        <DashboardBulletList items={data.activity} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.expert.consultingTitle')} delay={0.12} action={t('dashboard.viewAll')} actionHref="/contact-us">
        <DashboardStatGrid
          stats={[
            { label: t('dashboard.expert.newRequests'), value: data.consulting.newRequests, accent: true },
            { label: t('dashboard.expert.weeklySessions'), value: data.consulting.weeklySessions },
          ]}
        />
      </DashboardSection>

      <DashboardSection title={t('dashboard.expert.professionalCommunityTitle')} delay={0.14} action={t('dashboard.viewAll')} actionHref="/community">
        <DashboardBulletList items={data.professionalCommunity} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.expert.collaborationTitle')} delay={0.16} action={t('dashboard.viewAll')} actionHref="/contact-us">
        <DashboardBulletList items={data.collaboration} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.expert.contentMgmtTitle')} delay={0.18} action={t('dashboard.viewAll')} actionHref="/events">
        <DashboardBulletList items={data.contentMgmt} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.expert.incomeTitle')} span={2} delay={0.2}>
        <DashboardIncomeRow
          rows={[
            { label: t('dashboard.expert.incomeConsulting'), value: data.income.consulting },
            { label: t('dashboard.expert.incomeCourses'), value: data.income.courses },
            { label: t('dashboard.expert.incomeSeminars'), value: data.income.seminars },
          ]}
        />
      </DashboardSection>

      <DashboardSection title={t('dashboard.expert.personalBrandTitle')} span={2} delay={0.22} action={t('dashboard.viewAll')} actionHref="/career/profile">
        {data.personalBrand.length > 0 ? (
          <DashboardBulletList items={data.personalBrand} />
        ) : (
          <DashboardLinkList
            items={useLinkSection(t, 'dashboard.expert.personalBrand', [
              '/career/profile',
              '/events',
              '/community',
            ])}
          />
        )}
      </DashboardSection>
    </DashboardGrid>
  );
}
