'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemMetricGrid } from '@/components/ecosystem/shared/EcosystemMetricGrid';
import { EcosystemPipeline } from '@/components/ecosystem/shared/EcosystemPipeline';
import { EcosystemBarChart } from '@/components/ecosystem/shared/EcosystemBarChart';
import { EcosystemDataTable } from '@/components/ecosystem/shared/EcosystemDataTable';
import { EcosystemActionBar } from '@/components/ecosystem/shared/EcosystemActionBar';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { EcosystemPageLoader } from '@/components/ecosystem/shared/EcosystemPageLoader';
import { buildLeadStages } from '@/lib/ecosystem/constants';
import { useLanguage } from '@/lib/context/LanguageContext';
import { translateMetrics } from '@/lib/ecosystem/i18n';
import type { LeadStage } from '@/lib/ecosystem/types';

const LEAD_STAGE_COLORS: Record<LeadStage, string> = {
  new_lead: 'bg-blue-500/20 text-blue-300',
  contacted: 'bg-amber-500/20 text-amber-300',
  interested: 'bg-purple-500/20 text-purple-300',
  trial_class: 'bg-cyan-500/20 text-cyan-300',
  enrolled: 'bg-emerald-500/20 text-emerald-300',
};

export function AdmissionCrmClient({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const [view, setView] = useState<'pipeline' | 'table'>('pipeline');
  const data = useQuery(api.ecosystem.getAdmissionCrmDashboard, { email: userEmail });

  if (data === undefined) {
    return (
      <EcosystemPageLoader
        title={t('ecosystemPages.admissionCrm.title')}
        subtitle={t('ecosystemPages.admissionCrm.subtitle')}
      />
    );
  }

  const metrics = translateMetrics(data.metrics, t, 'ecosystemPages.admissionCrm.metrics');
  const leadStages = buildLeadStages(t);

  return (
    <AppPageShell
      title={t('ecosystemPages.admissionCrm.title')}
      subtitle={t('ecosystemPages.admissionCrm.subtitle')}
      actions={
        <EcosystemActionBar
          actions={[
            { label: t('ecosystemPages.admissionCrm.actions.addLead'), variant: 'default' },
            { label: t('ecosystemPages.admissionCrm.actions.scheduleFollowUp'), variant: 'outline' },
            { label: t('ecosystemPages.admissionCrm.actions.moveStage'), variant: 'outline' },
          ]}
        />
      }
    >
      <EcosystemSection title={t('ecosystemPages.shared.overview')}>
        <EcosystemMetricGrid stats={metrics} />
      </EcosystemSection>

      <div className="mb-8 grid gap-5 lg:grid-cols-2">
        <EcosystemBarChart
          data={data.leadSourceChart}
          title={t('ecosystemPages.admissionCrm.leadSource')}
          valueSuffix="%"
        />
        <div className="home-card">
          <h3 className="mb-4 text-sm font-semibold">{t('ecosystemPages.admissionCrm.conversionMetrics')}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="home-card-muted">
              <p className="text-xs text-muted-foreground">{t('ecosystemPages.admissionCrm.conversionRate')}</p>
              <p className="mt-2 text-3xl font-bold text-primary">{data.conversionRate}%</p>
            </div>
            <div className="home-card-muted">
              <p className="text-xs text-muted-foreground">{t('ecosystemPages.admissionCrm.enrollmentRevenue')}</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{data.enrollmentRevenue}</p>
            </div>
          </div>
        </div>
      </div>

      <EcosystemSection
        title={t('ecosystemPages.admissionCrm.pipelineSection')}
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
          data.leads.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-muted-foreground">
              {t('ecosystemPages.admissionCrm.emptyPipeline')}
            </div>
          ) : (
            <EcosystemPipeline stages={leadStages} leads={data.leads} />
          )
        ) : (
          <EcosystemDataTable
            rows={data.leads}
            emptyMessage={t('ecosystemPages.admissionCrm.emptyLeads')}
            columns={[
              { key: 'name', header: t('ecosystemPages.shared.table.name') },
              { key: 'phone', header: t('ecosystemPages.shared.table.phone') },
              { key: 'source', header: t('ecosystemPages.shared.table.source') },
              {
                key: 'stage',
                header: t('ecosystemPages.shared.table.stage'),
                render: (row) => (
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${LEAD_STAGE_COLORS[row.stage as LeadStage]}`}
                  >
                    {t(`ecosystemPages.shared.leadStages.${row.stage}`)}
                  </span>
                ),
              },
              { key: 'followUpDate', header: t('ecosystemPages.shared.followUp') },
              { key: 'notes', header: t('ecosystemPages.shared.table.notes'), className: 'max-w-[200px] truncate' },
            ]}
          />
        )}
      </EcosystemSection>
    </AppPageShell>
  );
}
