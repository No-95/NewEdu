'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  DashboardBulletList,
  DashboardGrid,
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

export function TeacherDashboard({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const data = useQuery(api.dashboard.getTeacherDashboard, { email: userEmail });

  if (data === undefined) {
    return <DashboardLoadingState />;
  }

  return (
    <DashboardGrid>
      <DashboardSection title={t('dashboard.teacher.overviewTitle')} span={2} delay={0.05}>
        <DashboardStatGrid
          stats={[
            { label: t('dashboard.teacher.students'), value: data.stats.students, accent: true },
            { label: t('dashboard.teacher.activeCourses'), value: data.stats.activeCourses },
            { label: t('dashboard.teacher.monthlyRevenue'), value: data.stats.monthlyRevenue },
          ]}
        />
      </DashboardSection>

      <DashboardSection title={t('dashboard.teacher.courseMgmtTitle')} delay={0.1}>
        <DashboardLinkList
          items={useLinkSection(t, 'dashboard.teacher.courseMgmt', [
            '/teacher-center/training-management',
            '/courses',
            '/teacher-center/training-management',
            '/teacher-center/reporting',
          ])}
        />
      </DashboardSection>

      <DashboardSection title={t('dashboard.teacher.crmTitle')} delay={0.12} action={t('dashboard.viewAll')} actionHref="/teacher-center/admission-crm">
        <DashboardKeyValueList
          rows={[
            { label: t('dashboard.teacher.leads'), value: data.crm.leads },
            { label: t('dashboard.teacher.consulted'), value: data.crm.consulted },
            { label: t('dashboard.teacher.pendingSignup'), value: data.crm.pendingSignup },
          ]}
        />
      </DashboardSection>

      <DashboardSection title={t('dashboard.teacher.studentMgmtTitle')} delay={0.14} action={t('dashboard.viewAll')} actionHref="/teacher-center/training-management">
        <DashboardBulletList items={data.recentStudents} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.teacher.marketingTitle')} delay={0.16}>
        <DashboardLinkList
          items={useLinkSection(t, 'dashboard.teacher.marketing', [
            '/courses',
            '/teacher-center/business-development',
            '/events',
            '/contact-us',
          ])}
        />
      </DashboardSection>

      <DashboardSection title={t('dashboard.teacher.instructorCommunityTitle')} delay={0.18} action={t('dashboard.viewAll')} actionHref="/community">
        <DashboardLinkList
          items={useLinkSection(t, 'dashboard.teacher.instructorCommunity', [
            '/teacher-center/resource-library',
            '/events',
            '/experts/events',
          ])}
        />
      </DashboardSection>

      <DashboardSection title={t('dashboard.teacher.reportsTitle')} delay={0.2} action={t('dashboard.viewAll')} actionHref="/teacher-center/reporting">
        <DashboardLinkList
          items={useLinkSection(t, 'dashboard.teacher.reports', [
            '/teacher-center/reporting',
            '/teacher-center/admission-crm',
            '/teacher-center/business-development',
          ])}
        />
      </DashboardSection>
    </DashboardGrid>
  );
}
