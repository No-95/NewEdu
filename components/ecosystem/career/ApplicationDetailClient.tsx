'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { EcosystemPageLoader } from '@/components/ecosystem/shared/EcosystemPageLoader';
import { useLanguage } from '@/lib/context/LanguageContext';
import { buildRecruitmentStages, RECRUITMENT_STAGE_IDS } from '@/lib/ecosystem/constants';
import { StageHistoryTimeline, stageReachedAt } from '@/components/ecosystem/shared/StageHistoryTimeline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const LOW_SCORE_THRESHOLD = 60;

export function ApplicationDetailClient({
  userEmail,
  applicationId,
}: {
  userEmail: string;
  applicationId: string;
}) {
  const { t } = useLanguage();
  const application = useQuery(api.employerOps.getApplicationDetail, {
    email: userEmail,
    applicationId: applicationId as Id<'recruitmentCandidates'>,
  });

  if (application === undefined) {
    return (
      <EcosystemPageLoader
        title={t('ecosystemPages.careerApplicationDetail.title')}
        subtitle={t('ecosystemPages.careerApplicationDetail.subtitle')}
      />
    );
  }

  if (!application) {
    return (
      <AppPageShell
        title={t('ecosystemPages.careerApplicationDetail.notFound')}
        subtitle={t('ecosystemPages.careerApplicationDetail.notFoundBody')}
      >
        <Button asChild variant="outline">
          <Link href="/career/applications">{t('ecosystemPages.careerApplicationDetail.backToList')}</Link>
        </Button>
      </AppPageShell>
    );
  }

  const stages = buildRecruitmentStages(t);
  const stageOrder = RECRUITMENT_STAGE_IDS.filter((key) => key !== 'rejected');
  const currentIndex = stageOrder.indexOf(application.stage as (typeof stageOrder)[number]);

  return (
    <AppPageShell
      title={application.jobTitle}
      subtitle={`${application.companyName}${application.department ? ` · ${application.department}` : ''}`}
      actions={
        <Button asChild variant="outline">
          <Link href="/career/applications">{t('ecosystemPages.careerApplicationDetail.backToList')}</Link>
        </Button>
      }
    >
      {application.jobExternalId ? (
        <p className="mb-6 text-sm">
          <Link href={`/jobs/${application.jobExternalId}`} className="font-semibold text-primary hover:underline">
            {t('ecosystemPages.careerApplicationDetail.viewJobPosting')} →
          </Link>
        </p>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="home-card-muted">
          <p className="text-xs text-muted-foreground">{t('ecosystemPages.shared.table.stage')}</p>
          <Badge className="mt-2 bg-primary/20 text-primary">
            {t(`ecosystemPages.shared.recruitmentStages.${application.stage}`)}
          </Badge>
        </div>
        <div className="home-card-muted">
          <p className="text-xs text-muted-foreground">{t('ecosystemPages.shared.table.score')}</p>
          <p className="mt-2 text-lg font-semibold text-primary">{application.score}/100</p>
        </div>
        <div className="home-card-muted">
          <p className="text-xs text-muted-foreground">{t('ecosystemPages.shared.table.date')}</p>
          <p className="mt-2 text-sm">{new Date(application.appliedAt).toLocaleDateString()}</p>
        </div>
      </div>

      {application.score < LOW_SCORE_THRESHOLD ? (
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-sm">
          <p className="text-amber-200">{t('ecosystemPages.careerApplicationDetail.lowScoreHint')}</p>
          <Link
            href="/career/profile"
            className="mt-3 inline-block font-semibold text-primary hover:underline"
          >
            {t('ecosystemPages.careerApplicationDetail.improveProfile')} →
          </Link>
        </div>
      ) : null}

      {application.location ? (
        <p className="mb-6 text-sm text-muted-foreground">
          {t('employerOps.location')}: {application.location}
        </p>
      ) : null}

      <EcosystemSection title={t('ecosystemPages.careerApplicationDetail.stageSection')}>
        {application.stage === 'rejected' ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-6 text-sm text-red-300">
            {t('ecosystemPages.careerApplicationDetail.rejectedMessage')}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {stages.map((stage, index) => {
              const done = currentIndex >= 0 && index <= currentIndex;
              const reachedAt = stageReachedAt(application.stageEvents, stage.key);
              return (
                <div
                  key={stage.key}
                  className={`flex flex-col gap-0.5 rounded-lg border px-3 py-2 text-sm ${
                    done ? 'border-primary/40 bg-primary/10 text-primary' : 'border-white/10 bg-white/5 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{stage.label}</span>
                    {done ? <span aria-hidden>✓</span> : null}
                  </div>
                  {reachedAt ? (
                    <span className="text-xs opacity-80">
                      {new Date(reachedAt).toLocaleDateString()}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </EcosystemSection>

      <EcosystemSection title={t('ecosystemPages.careerApplicationDetail.stageHistory.title')}>
        <StageHistoryTimeline events={application.stageEvents} />
      </EcosystemSection>
    </AppPageShell>
  );
}
