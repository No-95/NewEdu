'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLanguage } from '@/lib/context/LanguageContext';
import { formatTemplate } from '@/lib/dashboard/role-utils';
import { useMigrateLocalProgress } from '@/hooks/useMigrateLocalProgress';
import { LearnerHomeworkList } from '@/components/dashboard/WorksSection';
import {
  DashboardEmptyState,
  DashboardGrid,
  DashboardKeyValueList,
  DashboardLinkList,
  DashboardLoadingState,
  DashboardNextStepCta,
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
  const courses = useQuery(api.courses.getPublishedCourses, {});
  const syncTopikToCareer = useMutation(api.career.syncTopikLevelToCareerProfile);
  const [topikSyncMessage, setTopikSyncMessage] = useState('');
  const [syncingTopik, setSyncingTopik] = useState(false);

  const totalLecturesBySlug = useMemo(() => {
    const map: Record<string, number> = {};
    for (const course of courses ?? []) {
      map[course.slug] = course.lectures.length || course.totalVideos;
    }
    return map;
  }, [courses]);

  useMigrateLocalProgress(userEmail, totalLecturesBySlug);

  const displayName = fullName || t('dashboard.defaultName');

  const handleSyncTopik = async () => {
    setTopikSyncMessage('');
    setSyncingTopik(true);
    try {
      const result = await syncTopikToCareer({ email: userEmail });
      setTopikSyncMessage(
        t('dashboard.learner.topikSyncSuccess').replace('{level}', result.level ?? '')
      );
    } catch (err) {
      setTopikSyncMessage(err instanceof Error ? err.message : 'Could not sync TOPIK level.');
    } finally {
      setSyncingTopik(false);
    }
  };

  if (data === undefined) {
    return <DashboardLoadingState />;
  }

  const currentLevelLabel = data.learnerStageKey
    ? t(`onboarding.step4.learnerStages.${data.learnerStageKey}`)
    : data.currentLevel;

  return (
    <>
      {data.nextStep ? (
        <DashboardNextStepCta labelKey={data.nextStep.labelKey} href={data.nextStep.href} />
      ) : null}
      <DashboardGrid>
      <DashboardSection title={t('dashboard.learner.journeyTitle')} span={2} delay={0.05}>
        <p className="mb-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {formatTemplate(t('dashboard.learner.welcome'), { name: displayName })}
        </p>
        <DashboardKeyValueList
          rows={[
            { label: t('dashboard.learner.currentLevel'), value: currentLevelLabel },
            { label: t('dashboard.learner.goal'), value: data.goal },
            { label: t('dashboard.learner.progress'), value: `${data.progressPercent}%` },
          ]}
        />
        <div className="mt-6">
          <DashboardProgressBar label={t('dashboard.learner.progress')} value={data.progressPercent} />
        </div>
      </DashboardSection>

      <DashboardSection
        title={t('dashboard.learner.continueLearningTitle')}
        action={t('dashboard.continueLearning')}
        actionHref={
          data.continueLearning
            ? `/courses/${data.continueLearning.courseSlug}/${data.continueLearning.videoId}`
            : '/courses'
        }
        delay={0.08}
        span={2}
      >
        {data.continueLearning ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {formatTemplate(t('dashboard.learner.continueLearningBody'), {
                course: data.continueLearning.courseTitle,
                progress: String(data.continueLearning.progressPercent),
              })}
            </p>
            <Link
              href={`/courses/${data.continueLearning.courseSlug}/${data.continueLearning.videoId}`}
              className="home-btn-primary inline-flex px-5 py-2.5 text-sm"
            >
              {t('dashboard.continueLearning')}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <DashboardEmptyState message={t('dashboard.learner.continueLearningEmpty')} />
            <Link href="/courses" className="inline-block text-sm font-semibold text-primary hover:underline">
              {t('dashboard.learner.browseCourses')}
            </Link>
          </div>
        )}
      </DashboardSection>

      <DashboardSection
        title={t('dashboard.learner.activeCoursesTitle')}
        action={t('dashboard.viewAll')}
        actionHref="/courses"
        delay={0.1}
      >
        {data.activeCourses.length > 0 ? (
          <DashboardLinkList
            items={data.activeCourses.map((course) => ({
              label: `${course.title} · ${course.progress}%`,
              href: course.lastVideoId
                ? `/courses/${course.slug}/${course.lastVideoId}`
                : `/courses/${course.slug}`,
            }))}
          />
        ) : (
          <DashboardEmptyState message={t('dashboard.learner.activeCoursesEmpty')} />
        )}
      </DashboardSection>

      <DashboardSection
        title={t('dashboard.learner.recentTestsTitle')}
        action={t('dashboard.viewAll')}
        actionHref="/tests"
        delay={0.12}
      >
        {data.recentTests.length > 0 ? (
          <DashboardLinkList
            items={data.recentTests.map((attempt) => ({
              label: `${attempt.title} · ${attempt.scorePercent}%`,
              href: `/tests/${attempt.externalId}`,
            }))}
          />
        ) : (
          <DashboardEmptyState message={t('dashboard.learner.recentTestsEmpty')} />
        )}
      </DashboardSection>

      <DashboardSection title={t('dashboard.learner.homeworkTitle')} delay={0.14}>
        <LearnerHomeworkList items={data.homeworkItems} userEmail={userEmail} />
      </DashboardSection>

      <DashboardSection
        title={t('dashboard.learner.liveClassroomTitle')}
        delay={0.15}
        action={t('dashboard.continueLearning')}
        actionHref="/courses/classroom"
      >
        {data.liveRooms && data.liveRooms.length > 0 ? (
          <DashboardLinkList
            items={data.liveRooms.map((room) => ({ label: room.label, href: room.href }))}
          />
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{t('dashboard.learner.liveClassroomBody')}</p>
            <Link
              href="/courses/classroom"
              className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
            >
              {t('dashboard.learner.openClassroom')}
            </Link>
          </>
        )}
      </DashboardSection>

      <DashboardSection title={t('dashboard.learner.expertBridgeTitle')} delay={0.152} span={2}>
        <p className="text-sm text-muted-foreground">{t('dashboard.learner.expertBridgeBody')}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/experts/network" className="home-btn-primary inline-flex px-5 py-2.5 text-sm">
            {t('dashboard.learner.findMentor')}
          </Link>
          <Link
            href="/career/consultations"
            className="inline-flex items-center rounded-md border border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-white/5"
          >
            {t('dashboard.learner.requestConsultation')}
          </Link>
        </div>
      </DashboardSection>

      {data.hasJobSeekerRole ? (
        <DashboardSection title={t('dashboard.learner.topikBridgeTitle')} delay={0.155} span={2}>
          <p className="text-sm text-muted-foreground">{t('dashboard.learner.topikBridgeBody')}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleSyncTopik()}
              disabled={syncingTopik}
              className="home-btn-primary inline-flex px-5 py-2.5 text-sm disabled:opacity-60"
            >
              {syncingTopik ? t('dashboard.loadingData') : t('dashboard.learner.syncTopikToCareer')}
            </button>
            <Link
              href="/career/profile"
              className="inline-flex items-center rounded-md border border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-white/5"
            >
              {t('dashboard.updateProfile')}
            </Link>
          </div>
          {topikSyncMessage ? (
            <p className="mt-3 text-sm text-emerald-400">{topikSyncMessage}</p>
          ) : null}
        </DashboardSection>
      ) : null}

      <DashboardSection
        title={t('dashboard.learner.suggestedCoursesTitle')}
        delay={0.16}
        action={t('dashboard.viewAll')}
        actionHref="/courses"
      >
        {data.suggestedCourses.length > 0 ? (
          <DashboardLinkList
            items={data.suggestedCourses.map((course) => ({
              label: course.title,
              href: `/courses/${course.slug}`,
            }))}
          />
        ) : (
          <DashboardEmptyState message={t('dashboard.learner.suggestedCoursesEmpty')} />
        )}
      </DashboardSection>

      <DashboardSection
        title={t('dashboard.learner.topikPracticeTitle')}
        action={t('dashboard.viewAll')}
        actionHref="/tests?field=topik_exam"
        delay={0.18}
      >
        {data.recommendedTopikTests.length > 0 ? (
          <DashboardLinkList
            items={data.recommendedTopikTests.map((test) => ({
              label: `${test.title} · ${test.durationMinutes} min`,
              href: `/tests/${test.externalId}`,
            }))}
          />
        ) : (
          <DashboardEmptyState message={t('dashboard.learner.topikPracticeEmpty')} />
        )}
      </DashboardSection>

      <DashboardSection
        title={t('dashboard.learner.communityTitle')}
        delay={0.2}
        action={t('dashboard.viewAll')}
        actionHref="/community"
      >
        {data.communities.length > 0 ? (
          <DashboardLinkList
            items={data.communities.map((title) => ({
              label: title,
              href: '/community',
            }))}
          />
        ) : (
          <DashboardEmptyState message={t('dashboard.learner.communityEmpty')} />
        )}
      </DashboardSection>

      <DashboardSection
        title={t('dashboard.learner.eventsTitle')}
        delay={0.22}
        action={t('dashboard.viewAll')}
        actionHref="/events"
      >
        {data.events.length > 0 ? (
          <DashboardLinkList
            items={data.events.map((title) => ({
              label: title,
              href: '/events',
            }))}
          />
        ) : (
          <DashboardEmptyState message={t('dashboard.learner.eventsEmpty')} />
        )}
      </DashboardSection>

      {data.hasJobSeekerRole ? (
        <DashboardSection
          title={t('dashboard.learner.jobsTitle')}
          delay={0.24}
          action={t('dashboard.viewAll')}
          actionHref="/jobs"
        >
          {data.jobs.length > 0 ? (
            <DashboardLinkList
              items={data.jobs.map((title) => ({
                label: title,
                href: '/jobs',
              }))}
            />
          ) : (
            <DashboardEmptyState message={t('dashboard.learner.jobsEmpty')} />
          )}
        </DashboardSection>
      ) : null}

      <DashboardSection title={t('dashboard.learner.hdpPointsTitle')} delay={0.26}>
        <DashboardKeyValueList
          rows={[
            { label: t('dashboard.learner.hdpLevel'), value: data.hdpId },
            { label: t('dashboard.learner.hdpPoints'), value: `${data.hdpPoints.toLocaleString()} pts` },
            { label: t('dashboard.learner.balance'), value: data.balanceFormatted },
          ]}
        />
      </DashboardSection>

      {data.studyRecommendations && data.studyRecommendations.length > 0 ? (
        <DashboardSection title={t('dashboard.learner.studyRecommendationsTitle')} delay={0.255} span={2}>
          <DashboardLinkList
            items={data.studyRecommendations.map((rec) => ({
              label: t(rec.labelKey).replace('{field}', t(rec.fieldLabelKey)),
              href: rec.href,
            }))}
          />
        </DashboardSection>
      ) : null}
    </DashboardGrid>
    </>
  );
}
