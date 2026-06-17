'use client';

import { useState } from 'react';
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
import { downloadCsv, downloadTextFile } from '@/lib/utils/client-actions';

export function ReportingClient({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const [sinceDays, setSinceDays] = useState<number | null>(null);
  const since =
    sinceDays === null ? undefined : Date.now() - sinceDays * 24 * 60 * 60 * 1000;
  const data = useQuery(api.ecosystem.getReportingDashboard, { email: userEmail, since });

  if (data === undefined) {
    return (
      <EcosystemPageLoader
        title={t('ecosystemPages.reporting.title')}
        subtitle={t('ecosystemPages.reporting.subtitle')}
      />
    );
  }

  const metrics = translateMetrics(data.metrics, t, 'ecosystemPages.reporting.metrics');

  const exportReport = (format: 'txt' | 'csv') => {
    const rows = [
      ...data.revenueChart.map((point) => ({ section: 'Revenue', label: point.label, value: point.value })),
      ...data.studentGrowthChart.map((point) => ({ section: 'Student Growth', label: point.label, value: point.value })),
      ...data.completionChart.map((point) => ({ section: 'Completion', label: point.label, value: point.value })),
      ...data.teacherReports.map((teacher) => ({
        section: 'Teacher',
        label: teacher.name,
        value: `${teacher.rating}/5 · ${teacher.classes} classes · ${teacher.completion}%`,
      })),
    ];

    if (format === 'csv') {
      downloadCsv(
        'hdp-edu-report.csv',
        rows.map((row) => ({ section: row.section, label: row.label, value: String(row.value) })),
        [
          { key: 'section', label: 'Section' },
          { key: 'label', label: 'Label' },
          { key: 'value', label: 'Value' },
        ]
      );
      return;
    }

    const lines = [
      t('ecosystemPages.reporting.title'),
      '',
      ...metrics.map((metric) => `${metric.label}: ${metric.value}`),
      '',
      ...rows.map((row) => `${row.section} — ${row.label}: ${row.value}`),
    ];
    downloadTextFile('hdp-edu-report.txt', lines.join('\n'));
  };

  return (
    <AppPageShell
      title={t('ecosystemPages.reporting.title')}
      subtitle={t('ecosystemPages.reporting.subtitle')}
      actions={
        <EcosystemActionBar
          actions={[
            { label: t('ecosystemPages.reporting.actions.exportSummary'), variant: 'default', onClick: () => exportReport('txt') },
            { label: t('ecosystemPages.reporting.actions.exportCsv'), variant: 'outline', onClick: () => exportReport('csv') },
          ]}
        />
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { label: t('ecosystemPages.reporting.filters.all'), days: null },
          { label: t('ecosystemPages.reporting.filters.last30'), days: 30 },
          { label: t('ecosystemPages.reporting.filters.last90'), days: 90 },
        ].map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => setSinceDays(filter.days)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              sinceDays === filter.days
                ? 'bg-primary text-primary-foreground'
                : 'border border-border/60 bg-muted text-muted-foreground'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
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
