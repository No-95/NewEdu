'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemMetricGrid } from '@/components/ecosystem/shared/EcosystemMetricGrid';
import { EcosystemDataTable } from '@/components/ecosystem/shared/EcosystemDataTable';
import { EcosystemActionBar } from '@/components/ecosystem/shared/EcosystemActionBar';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { EcosystemPageLoader } from '@/components/ecosystem/shared/EcosystemPageLoader';
import { EcosystemPipeline } from '@/components/ecosystem/shared/EcosystemPipeline';
import { useLanguage } from '@/lib/context/LanguageContext';
import { translateMetrics } from '@/lib/ecosystem/i18n';
import { buildRecruitmentStages } from '@/lib/ecosystem/constants';
import { scrollToElementId } from '@/lib/utils/client-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CreateCandidateDialog,
  CreateJobPostingDialog,
  EditJobPostingDialog,
} from '@/components/ecosystem/business/EmployerOpsDialogs';

export function RecruitmentClient({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const router = useRouter();
  const data = useQuery(api.ecosystem.getRecruitmentDashboard, { email: userEmail });
  const advanceCandidate = useMutation(api.employerOps.advanceCandidateStage);
  const updateJobStatus = useMutation(api.employerOps.updateJobPostingStatus);
  const seedDemo = useMutation(api.employerOps.seedEmployerEcosystem);
  const [postJobOpen, setPostJobOpen] = useState(false);
  const [addCandidateOpen, setAddCandidateOpen] = useState(false);
  const [editJobOpen, setEditJobOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<{
    id: string;
    title: string;
    department: string;
    location?: string;
    salary?: string;
    description?: string;
  } | null>(null);
  const [view, setView] = useState<'pipeline' | 'table'>('pipeline');

  if (data === undefined) {
    return (
      <EcosystemPageLoader
        title={t('ecosystemPages.recruitment.title')}
        subtitle={t('ecosystemPages.recruitment.subtitle')}
      />
    );
  }

  const metrics = translateMetrics(data.metrics, t, 'ecosystemPages.recruitment.metrics');
  const recruitmentStages = buildRecruitmentStages(t);
  const pipelineLeads = data.candidates.map((candidate) => ({
    id: candidate.id,
    name: candidate.name,
    source: candidate.position,
    stage: candidate.stage,
    followUpDate: `${candidate.score}/100`,
    phone: '',
  }));

  return (
    <AppPageShell
      title={t('ecosystemPages.recruitment.title')}
      subtitle={t('ecosystemPages.recruitment.subtitle')}
      actions={
        <EcosystemActionBar
          actions={[
            {
              label: t('ecosystemPages.recruitment.actions.postJob'),
              variant: 'default',
              onClick: () => setPostJobOpen(true),
            },
            {
              label: t('employerOps.addCandidate'),
              variant: 'outline',
              onClick: () => setAddCandidateOpen(true),
            },
            {
              label: t('ecosystemPages.recruitment.actions.viewCandidates'),
              variant: 'outline',
              onClick: () => scrollToElementId('recruitment-candidates'),
            },
            ...(data.jobPostings.length === 0
              ? [
                  {
                    label: t('employerOps.seedDemo'),
                    variant: 'outline' as const,
                    onClick: () => void seedDemo({ email: userEmail }),
                  },
                ]
              : []),
          ]}
        />
      }
    >
      <CreateJobPostingDialog userEmail={userEmail} open={postJobOpen} onOpenChange={setPostJobOpen} />
      <EditJobPostingDialog
        userEmail={userEmail}
        open={editJobOpen}
        onOpenChange={setEditJobOpen}
        jobPosting={editingJob}
      />
      <CreateCandidateDialog
        userEmail={userEmail}
        open={addCandidateOpen}
        onOpenChange={setAddCandidateOpen}
        jobPostings={data.jobPostings.map((job) => ({ id: job.id, title: job.title }))}
      />

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
            {
              key: 'actions',
              header: t('ecosystemPages.shared.table.actions'),
              render: (row) => (
                <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => {
                      setEditingJob({
                        id: row.id,
                        title: row.title,
                        department: row.department,
                        location: row.location,
                        salary: row.salary,
                        description: row.description,
                      });
                      setEditJobOpen(true);
                    }}
                  >
                    {t('employerOps.editJob')}
                  </Button>
                  {row.status === 'draft' ? (
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() =>
                        void updateJobStatus({
                          email: userEmail,
                          jobPostingId: row.id as Id<'recruitmentJobPostings'>,
                          status: 'open',
                        })
                      }
                    >
                      {t('employerOps.publishJob')}
                    </Button>
                  ) : row.status === 'open' ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() =>
                        void updateJobStatus({
                          email: userEmail,
                          jobPostingId: row.id as Id<'recruitmentJobPostings'>,
                          status: 'closed',
                        })
                      }
                    >
                      {t('employerOps.closeJob')}
                    </Button>
                  ) : row.status === 'closed' ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() =>
                        void updateJobStatus({
                          email: userEmail,
                          jobPostingId: row.id as Id<'recruitmentJobPostings'>,
                          status: 'open',
                        })
                      }
                    >
                      {t('employerOps.reopenJob')}
                    </Button>
                  ) : null}
                </div>
              ),
            },
          ]}
        />
      </EcosystemSection>

      <EcosystemSection
        id="recruitment-candidates"
        title={t('ecosystemPages.recruitment.interviewPipeline')}
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setView('pipeline')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${view === 'pipeline' ? 'bg-primary text-primary-foreground' : 'bg-white/5 text-muted-foreground'}`}
            >
              {t('ecosystemPages.shared.kanban')}
            </button>
            <button
              type="button"
              onClick={() => setView('table')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${view === 'table' ? 'bg-primary text-primary-foreground' : 'bg-white/5 text-muted-foreground'}`}
            >
              {t('ecosystemPages.shared.tableView')}
            </button>
          </div>
        }
      >
        {view === 'pipeline' ? (
          pipelineLeads.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-muted-foreground">
              {t('ecosystemPages.recruitment.emptyCandidates')}
            </div>
          ) : (
            <EcosystemPipeline
              stages={recruitmentStages}
              leads={pipelineLeads}
              terminalStages={['offer', 'rejected']}
              advanceLabel={t('employerOps.advanceStage')}
              onAdvanceLead={(candidateId) =>
                void advanceCandidate({
                  email: userEmail,
                  candidateId: candidateId as Id<'recruitmentCandidates'>,
                })
              }
            />
          )
        ) : (
          <EcosystemDataTable
            rows={data.candidates}
            emptyMessage={t('ecosystemPages.recruitment.emptyCandidates')}
            onRowClick={(row) => router.push(`/business/recruitment/candidates/${row.id}`)}
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
        )}
      </EcosystemSection>
    </AppPageShell>
  );
}
