'use client';

import React from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { formatTemplate } from '@/lib/dashboard/role-utils';
import {
  DashboardBulletList,
  DashboardGrid,
  DashboardKeyValueList,
  DashboardProgressBar,
  DashboardSection,
} from '@/components/dashboard/shared/DashboardPrimitives';

function useList(t: ReturnType<typeof useLanguage>['t'], key: string): string[] {
  const value = t(key, { returnObjects: true });
  return Array.isArray(value) ? value : [];
}

export function LearnerDashboard({ fullName }: { fullName: string }) {
  const { t } = useLanguage();
  const displayName = fullName || t('dashboard.defaultName');

  return (
    <DashboardGrid>
      <DashboardSection title={t('dashboard.learner.journeyTitle')} span={2} delay={0.05}>
        <p className="mb-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {formatTemplate(t('dashboard.learner.welcome'), { name: displayName })}
        </p>
        <DashboardKeyValueList
          rows={[
            { label: t('dashboard.learner.currentLevel'), value: t('dashboard.learner.currentLevelValue') },
            { label: t('dashboard.learner.goal'), value: t('dashboard.learner.goalValue') },
            { label: t('dashboard.learner.progress'), value: t('dashboard.learner.progressValue') },
          ]}
        />
        <div className="mt-6">
          <DashboardProgressBar label={t('dashboard.learner.progress')} value={62} />
        </div>
      </DashboardSection>

      <DashboardSection
        title={t('dashboard.learner.activeCoursesTitle')}
        action={t('dashboard.continueLearning')}
        actionHref="/courses"
        delay={0.1}
      >
        <DashboardBulletList items={useList(t, 'dashboard.learner.activeCourses')} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.learner.suggestedCoursesTitle')} delay={0.12}>
        <DashboardBulletList items={useList(t, 'dashboard.learner.suggestedCourses')} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.learner.jobsTitle')} delay={0.14}>
        <DashboardBulletList items={useList(t, 'dashboard.learner.jobs')} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.learner.materialsTitle')} delay={0.16}>
        <DashboardBulletList items={useList(t, 'dashboard.learner.materials')} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.learner.communityTitle')} delay={0.18}>
        <DashboardBulletList items={useList(t, 'dashboard.learner.communities')} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.learner.eventsTitle')} delay={0.2}>
        <DashboardBulletList items={useList(t, 'dashboard.learner.events')} />
      </DashboardSection>

      <DashboardSection title={t('dashboard.learner.hdpPointsTitle')} delay={0.22}>
        <DashboardKeyValueList
          rows={[
            { label: t('dashboard.learner.hdpLevel'), value: t('dashboard.learner.hdpLevelValue') },
            { label: t('dashboard.learner.hdpPoints'), value: t('dashboard.learner.hdpPointsValue') },
          ]}
        />
      </DashboardSection>
    </DashboardGrid>
  );
}
