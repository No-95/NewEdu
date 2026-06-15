'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemMetricGrid } from '@/components/ecosystem/shared/EcosystemMetricGrid';
import { EcosystemDataTable } from '@/components/ecosystem/shared/EcosystemDataTable';
import { EcosystemActionBar } from '@/components/ecosystem/shared/EcosystemActionBar';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { EcosystemPageLoader } from '@/components/ecosystem/shared/EcosystemPageLoader';
import { useLanguage } from '@/lib/context/LanguageContext';
import { translateMetrics } from '@/lib/ecosystem/i18n';
import { Badge } from '@/components/ui/badge';

export function RecruitmentClient({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const data = useQuery(api.ecosystem.getRecruitmentDashboard, { email: userEmail });

  if (data === undefined) {
    return (
      <EcosystemPageLoader
        title={t('ecosystemPages.recruitment.title')}
        subtitle={t('ecosystemPages.recruitment.subtitle')}
      />
    );
  }

  const metrics = translateMetrics(data.metrics, t, 'ecosystemPages.recruitment.metrics');

  return (
    <AppPageShell
      title={t('ecosystemPages.recruitment.title')}
      subtitle={t('ecosystemPages.recruitment.subtitle')}
      actions={
        <EcosystemActionBar
          actions={[
            { label: t('ecosystemPages.recruitment.actions.postJob'), variant: 'default' },
            { label: t('ecosystemPages.recruitment.actions.viewCandidates'), variant: 'outline' },
            { label: t('ecosystemPages.recruitment.actions.scheduleInterview'), variant: 'outline' },
          ]}
        />
      }
    >
      <EcosystemSection title={t('ecosystemPages.shared.dashboard')}>
        <EcosystemMetricGrid stats={metrics} />
      </EcosystemSection>

      <EcosystemSection title={t('ecosystemPages.recruitment.openPositions')}>
        <EcosystemDataTable
          rows={data.jobPostings}
          emptyMessage={t('ecosystemPages.recruitment.emptyJobs')}
          columns={[
            { key: 'title', header: t('ecosystemPages.shared.table.title') },
            { key: 'department', header: t('ecosystemPages.shared.table.department') },
            { key: 'applicants', header: t('ecosystemPages.shared.table.applicants') },
            {
              key: 'status',
              header: t('ecosystemPages.shared.table.status'),
              render: (row) => (
                <Badge className={row.status === 'open' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10'}>
                  {row.status === 'open'
                    ? t('ecosystemPages.shared.status.open')
                    : row.status === 'closed'
                      ? t('ecosystemPages.shared.status.closed')
                      : t('ecosystemPages.shared.status.draft')}
                </Badge>
              ),
            },
            { key: 'postedAt', header: t('ecosystemPages.shared.table.postedAt') },
          ]}
        />
      </EcosystemSection>

      <EcosystemSection title={t('ecosystemPages.recruitment.interviewPipeline')}>
        <EcosystemDataTable
          rows={data.candidates}
          emptyMessage={t('ecosystemPages.recruitment.emptyCandidates')}
          columns={[
            { key: 'name', header: t('ecosystemPages.shared.table.name') },
            { key: 'position', header: t('ecosystemPages.shared.table.position') },
            {
              key: 'stage',
              header: t('ecosystemPages.shared.table.stage'),
              render: (row) => (
                <Badge className="bg-primary/20 text-primary">
                  {t(`ecosystemPages.shared.recruitmentStages.${row.stage}`)}
                </Badge>
              ),
            },
            {
              key: 'score',
              header: t('ecosystemPages.shared.table.score'),
              render: (row) => <span className="font-semibold text-primary">{row.score}/100</span>,
            },
          ]}
        />
      </EcosystemSection>
    </AppPageShell>
  );
}
