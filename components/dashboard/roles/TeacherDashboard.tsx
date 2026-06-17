'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  DashboardEmptyState,
  DashboardGrid,
  DashboardKeyValueList,
  DashboardLinkList,
  DashboardLoadingState,
  DashboardNextStepCta,
  DashboardSection,
  DashboardStatGrid,
} from '@/components/dashboard/shared/DashboardPrimitives';

export function TeacherDashboard({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const data = useQuery(api.dashboard.getTeacherDashboard, { email: userEmail });

  if (data === undefined) {
    return <DashboardLoadingState />;
  }

  const overviewTitle = data.isTrainingCenter
    ? t('dashboard.teacher.centerOverviewTitle')
    : t('dashboard.teacher.overviewTitle');

  return (
    <>
      {data.nextStep ? (
        <DashboardNextStepCta labelKey={data.nextStep.labelKey} href={data.nextStep.href} />
      ) : null}
      <DashboardGrid>
      <DashboardSection title={overviewTitle} span={2} delay={0.05}>
        <DashboardStatGrid
          stats={[
            { label: t('dashboard.teacher.students'), value: data.stats.students, accent: true },
            { label: t('dashboard.teacher.activeCourses'), value: data.stats.activeCourses },
            { label: t('dashboard.teacher.monthlyRevenue'), value: data.stats.monthlyRevenue },
          ]}
        />
      </DashboardSection>

      <DashboardSection
        title={t('dashboard.teacher.followUpsTitle')}
        action={t('dashboard.viewAll')}
        actionHref="/teacher-center/admission-crm"
        delay={0.08}
      >
        {data.followUpsToday.length > 0 ? (
          <DashboardLinkList
            items={data.followUpsToday.map((lead) => ({
              label: `${lead.name} · ${lead.followUpDate}`,
              href: lead.href,
            }))}
          />
        ) : (
          <DashboardEmptyState message={t('dashboard.teacher.followUpsEmpty')} />
        )}
      </DashboardSection>

      <DashboardSection
        title={t('dashboard.teacher.classesTitle')}
        action={t('dashboard.viewAll')}
        actionHref="/teacher-center/training-management"
        delay={0.1}
      >
        {data.classes.length > 0 ? (
          <DashboardLinkList
            items={data.classes.map((cls) => ({
              label: `${cls.name} · ${cls.students}/${cls.capacity}`,
              href: '/teacher-center/training-management',
            }))}
          />
        ) : (
          <DashboardEmptyState message={t('dashboard.teacher.classesEmpty')} />
        )}
      </DashboardSection>

      <DashboardSection
        title={t('dashboard.teacher.studentMgmtTitle')}
        action={t('dashboard.viewAll')}
        actionHref="/teacher-center/training-management"
        delay={0.12}
      >
        {data.recentStudents.length > 0 ? (
          <DashboardLinkList
            items={data.recentStudents.map((label) => ({
              label,
              href: '/teacher-center/training-management',
            }))}
          />
        ) : (
          <DashboardEmptyState message={t('dashboard.teacher.studentsEmpty')} />
        )}
      </DashboardSection>

      <DashboardSection
        title={t('dashboard.teacher.crmTitle')}
        action={t('dashboard.viewAll')}
        actionHref="/teacher-center/admission-crm"
        delay={0.14}
      >
        <DashboardKeyValueList
          rows={[
            { label: t('dashboard.teacher.leads'), value: data.crm.leads },
            { label: t('dashboard.teacher.consulted'), value: data.crm.consulted },
            { label: t('dashboard.teacher.pendingSignup'), value: data.crm.pendingSignup },
          ]}
        />
      </DashboardSection>

      <DashboardSection
        title={t('dashboard.teacher.homeworkTitle')}
        action={t('dashboard.viewAll')}
        actionHref="/teacher-center/training-management"
        delay={0.16}
      >
        {data.pendingHomeworkCount > 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('dashboard.teacher.homeworkPending').replace('{count}', String(data.pendingHomeworkCount))}
          </p>
        ) : (
          <DashboardEmptyState message={t('dashboard.teacher.homeworkEmpty')} />
        )}
      </DashboardSection>

      <DashboardSection
        title={t('dashboard.teacher.liveClassroomTitle')}
        delay={0.18}
        action={t('dashboard.continueLearning')}
        actionHref="/courses/classroom"
      >
        {data.liveRooms && data.liveRooms.length > 0 ? (
          <DashboardLinkList items={data.liveRooms.map((room) => ({ label: room.label, href: room.href }))} />
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{t('dashboard.teacher.liveClassroomBody')}</p>
            <Link href="/courses/classroom" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
              {t('dashboard.teacher.openClassroom')}
            </Link>
          </>
        )}
      </DashboardSection>

      <DashboardSection
        title={t('dashboard.teacher.courseMgmtTitle')}
        delay={0.2}
        action={t('dashboard.viewAll')}
        actionHref="/teacher-center/courses"
      >
        {data.ownedCourseCount > 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('dashboard.teacher.ownedCourses').replace('{count}', String(data.ownedCourseCount))}
          </p>
        ) : (
          <DashboardEmptyState message={t('dashboard.teacher.coursesEmpty')} />
        )}
      </DashboardSection>

      <DashboardSection
        title={t('dashboard.teacher.reportsTitle')}
        delay={0.22}
        action={t('dashboard.viewAll')}
        actionHref="/teacher-center/reporting"
      >
        <DashboardLinkList
          items={[
            { label: t('dashboard.teacher.reportsRevenue'), href: '/teacher-center/reporting' },
            { label: t('dashboard.teacher.reportsCrm'), href: '/teacher-center/admission-crm' },
            { label: t('dashboard.teacher.reportsResources'), href: '/teacher-center/resource-library' },
          ]}
        />
      </DashboardSection>
    </DashboardGrid>
    </>
  );
}
