'use client';

import React from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  DashboardBulletList,
  DashboardGrid,
  DashboardIncomeRow,
  DashboardKeyValueList,
  DashboardSection,
  DashboardStatGrid,
} from '@/components/dashboard/shared/DashboardPrimitives';

function useList(t: ReturnType<typeof useLanguage>['t'], key: string): string[] {
  const value = t(key, { returnObjects: true });
  return Array.isArray(value) ? value : [];
}

export function ExpertDashboard() {
  const { t } = useLanguage();

  return (
    <DashboardGrid>
      <DashboardSection title={t('dashboard.expert.profileTitle')} span={2} delay={0.05}>
        <DashboardKeyValueList
          rows={[
            { label: t('dashboard.expert.credibility'), value: t('dashboard.expert.credibilityValue') },
            { label: t('dashboard.expert.followers'), value: t('dashboard.expert.followersValue') },
          ]}
        />
      </DashboardSection>

      <DashboardSection title={t('dashboard.expert.activityTitle')} delay={0.1}>
        <DashboardBulletList items={useList(t, 'dashboard.expert.activity')} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.expert.consultingTitle')} delay={0.12}>
        <DashboardStatGrid
          stats={[
            { label: t('dashboard.expert.newRequests'), value: t('dashboard.expert.newRequestsValue'), accent: true },
            { label: t('dashboard.expert.weeklySessions'), value: t('dashboard.expert.weeklySessionsValue') },
          ]}
        />
      </DashboardSection>

      <DashboardSection title={t('dashboard.expert.professionalCommunityTitle')} delay={0.14}>
        <DashboardBulletList items={useList(t, 'dashboard.expert.professionalCommunity')} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.expert.collaborationTitle')} delay={0.16}>
        <DashboardBulletList items={useList(t, 'dashboard.expert.collaboration')} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.expert.contentMgmtTitle')} delay={0.18}>
        <DashboardBulletList items={useList(t, 'dashboard.expert.contentMgmt')} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.expert.incomeTitle')} span={2} delay={0.2}>
        <DashboardIncomeRow
          rows={[
            { label: t('dashboard.expert.incomeConsulting'), value: t('dashboard.expert.incomeConsultingValue') },
            { label: t('dashboard.expert.incomeCourses'), value: t('dashboard.expert.incomeCoursesValue') },
            { label: t('dashboard.expert.incomeSeminars'), value: t('dashboard.expert.incomeSeminarsValue') },
          ]}
        />
      </DashboardSection>

      <DashboardSection title={t('dashboard.expert.personalBrandTitle')} span={2} delay={0.22}>
        <DashboardBulletList items={useList(t, 'dashboard.expert.personalBrand')} />
      </DashboardSection>
    </DashboardGrid>
  );
}
