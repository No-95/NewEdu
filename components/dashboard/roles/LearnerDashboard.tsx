'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLanguage } from '@/lib/context/LanguageContext';
import { formatTemplate } from '@/lib/dashboard/role-utils';
import {
  DashboardBulletList,
  DashboardEmptyState,
  DashboardGrid,
  DashboardKeyValueList,
  DashboardLinkList,
  DashboardLoadingState,
  DashboardProgressBar,
  DashboardSection,
} from '@/components/dashboard/shared/DashboardPrimitives';

export function LearnerDashboard({
  fullName,
  userEmail,
}: {
  fullName: string;
  userEmail: string;
}) {
  const { t } = useLanguage();
  const data = useQuery(api.dashboard.getLearnerDashboard, { email: userEmail });
  const displayName = fullName || t('dashboard.defaultName');

  if (data === undefined) {
    return <DashboardLoadingState />;
  }

  const activeCourseItems =
    data.activeCourses.length > 0
      ? data.activeCourses.map((course) => `${course.title} · ${course.progress}%`)
      : [];

  return (
    <DashboardGrid>
      <DashboardSection title={t('dashboard.learner.journeyTitle')} span={2} delay={0.05}>
        <p className="mb-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {formatTemplate(t('dashboard.learner.welcome'), { name: displayName })}
        </p>
        <DashboardKeyValueList
          rows={[
            { label: t('dashboard.learner.currentLevel'), value: data.currentLevel },
            { label: t('dashboard.learner.goal'), value: data.goal },
            { label: t('dashboard.learner.progress'), value: `${data.progressPercent}%` },
          ]}
        />
        <div className="mt-6">
          <DashboardProgressBar label={t('dashboard.learner.progress')} value={data.progressPercent} />
        </div>
      </DashboardSection>

      <DashboardSection
        title={t('dashboard.learner.activeCoursesTitle')}
        action={t('dashboard.continueLearning')}
        actionHref="/courses"
        delay={0.1}
      >
        {data.activeCourses.length > 0 ? (
          <DashboardLinkList
            items={data.activeCourses.map((course) => ({
              label: `${course.title} · ${course.progress}%`,
              href: `/courses/${course.slug}`,
            }))}
          />
        ) : (
          <DashboardBulletList items={activeCourseItems} />
        )}
      </DashboardSection>

      <DashboardSection title={t('dashboard.learner.suggestedCoursesTitle')} delay={0.12} action={t('dashboard.viewAll')} actionHref="/courses">
        <DashboardBulletList items={data.suggestedCourses} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.learner.jobsTitle')} delay={0.14} action={t('dashboard.viewAll')} actionHref="/jobs">
        <DashboardBulletList items={data.jobs} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.learner.materialsTitle')} delay={0.16} action={t('dashboard.viewAll')} actionHref="/books">
        <DashboardBulletList items={data.materials} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.learner.communityTitle')} delay={0.18} action={t('dashboard.viewAll')} actionHref="/community">
        <DashboardBulletList items={data.communities} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.learner.eventsTitle')} delay={0.2} action={t('dashboard.viewAll')} actionHref="/events">
        <DashboardBulletList items={data.events} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.learner.hdpPointsTitle')} delay={0.22}>
        <DashboardKeyValueList
          rows={[
            { label: t('dashboard.learner.hdpLevel'), value: data.hdpId },
            { label: t('dashboard.learner.hdpPoints'), value: `${data.hdpPoints.toLocaleString()} pts` },
            { label: t('dashboard.learner.balance'), value: data.balanceFormatted },
          ]}
        />
      </DashboardSection>
    </DashboardGrid>
  );
}
