'use client';

import React from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  DashboardBulletList,
  DashboardGrid,
  DashboardKeyValueList,
  DashboardSection,
  DashboardStatGrid,
} from '@/components/dashboard/shared/DashboardPrimitives';

function useList(t: ReturnType<typeof useLanguage>['t'], key: string): string[] {
  const value = t(key, { returnObjects: true });
  return Array.isArray(value) ? value : [];
}

export function TeacherDashboard() {
  const { t } = useLanguage();

  return (
    <DashboardGrid>
      <DashboardSection title={t('dashboard.teacher.overviewTitle')} span={2} delay={0.05}>
        <DashboardStatGrid
          stats={[
            { label: t('dashboard.teacher.students'), value: t('dashboard.teacher.studentsValue'), accent: true },
            { label: t('dashboard.teacher.activeCourses'), value: t('dashboard.teacher.activeCoursesValue') },
            { label: t('dashboard.teacher.monthlyRevenue'), value: t('dashboard.teacher.monthlyRevenueValue') },
          ]}
        />
      </DashboardSection>

      <DashboardSection title={t('dashboard.teacher.courseMgmtTitle')} delay={0.1}>
        <DashboardBulletList items={useList(t, 'dashboard.teacher.courseMgmt')} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.teacher.crmTitle')} delay={0.12}>
        <DashboardKeyValueList
          rows={[
            { label: t('dashboard.teacher.leads'), value: t('dashboard.teacher.leadsValue') },
            { label: t('dashboard.teacher.consulted'), value: t('dashboard.teacher.consultedValue') },
            { label: t('dashboard.teacher.pendingSignup'), value: t('dashboard.teacher.pendingSignupValue') },
          ]}
        />
      </DashboardSection>

      <DashboardSection title={t('dashboard.teacher.studentMgmtTitle')} delay={0.14}>
        <DashboardBulletList items={useList(t, 'dashboard.teacher.studentMgmt')} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.teacher.marketingTitle')} delay={0.16}>
        <DashboardBulletList items={useList(t, 'dashboard.teacher.marketing')} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.teacher.instructorCommunityTitle')} delay={0.18}>
        <DashboardBulletList items={useList(t, 'dashboard.teacher.instructorCommunity')} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.teacher.reportsTitle')} delay={0.2}>
        <DashboardBulletList items={useList(t, 'dashboard.teacher.reports')} />
      </DashboardSection>
    </DashboardGrid>
  );
}
