'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemMetricGrid } from '@/components/ecosystem/shared/EcosystemMetricGrid';
import { EcosystemBarChart } from '@/components/ecosystem/shared/EcosystemBarChart';
import { EcosystemActionBar } from '@/components/ecosystem/shared/EcosystemActionBar';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { EcosystemPageLoader } from '@/components/ecosystem/shared/EcosystemPageLoader';
import { useLanguage } from '@/lib/context/LanguageContext';
import { translateMetrics } from '@/lib/ecosystem/i18n';

export function ReportingClient({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const data = useQuery(api.ecosystem.getReportingDashboard, { email: userEmail });

  if (data === undefined) {
    return (
      <EcosystemPageLoader
        title={t('ecosystemPages.reporting.title')}
        subtitle={t('ecosystemPages.reporting.subtitle')}
      />
    );
  }

  const metrics = translateMetrics(data.metrics, t, 'ecosystemPages.reporting.metrics');

  return (
    <AppPageShell
      title={t('ecosystemPages.reporting.title')}
      subtitle={t('ecosystemPages.reporting.subtitle')}
      actions={
        <EcosystemActionBar
          actions={[
            { label: t('ecosystemPages.reporting.actions.exportPdf'), variant: 'default' },
            { label: t('ecosystemPages.reporting.actions.exportExcel'), variant: 'outline' },
            { label: t('ecosystemPages.reporting.actions.exportCsv'), variant: 'outline' },
          ]}
        />
      }
    >
      <EcosystemSection title={t('ecosystemPages.shared.overview')}>
        <EcosystemMetricGrid stats={metrics} />
      </EcosystemSection>

      <div className="grid gap-5 lg:grid-cols-2">
        <EcosystemSection title={t('ecosystemPages.reporting.monthlyRevenue')}>
          <EcosystemBarChart data={data.revenueChart} valueSuffix="M" />
        </EcosystemSection>
        <EcosystemSection title={t('ecosystemPages.reporting.studentGrowth')}>
          <EcosystemBarChart data={data.studentGrowthChart} />
        </EcosystemSection>
      </div>

      <EcosystemSection title={t('ecosystemPages.reporting.completionByCourse')}>
        <EcosystemBarChart data={data.completionChart} valueSuffix="%" />
      </EcosystemSection>

      <EcosystemSection title={t('ecosystemPages.reporting.teacherReports')}>
        {data.teacherReports.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-muted-foreground">
            {t('ecosystemPages.reporting.emptyTeachers')}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {data.teacherReports.map((teacher) => (
              <div key={teacher.id} className="home-card-muted">
                <p className="font-semibold text-foreground">{teacher.name}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('ecosystemPages.shared.rating')}{' '}
                  {teacher.rating > 0 ? `${teacher.rating}/5` : '—'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('ecosystemPages.shared.classes')} {teacher.classes}
                </p>
                <p className="text-sm text-primary">
                  {t('ecosystemPages.shared.completion')} {teacher.completion}%
                </p>
              </div>
            ))}
          </div>
        )}
      </EcosystemSection>
    </AppPageShell>
  );
}
