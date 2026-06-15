'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemMetricGrid } from '@/components/ecosystem/shared/EcosystemMetricGrid';
import { EcosystemBarChart } from '@/components/ecosystem/shared/EcosystemBarChart';
import { EcosystemDataTable } from '@/components/ecosystem/shared/EcosystemDataTable';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { EcosystemPageLoader } from '@/components/ecosystem/shared/EcosystemPageLoader';
import { useLanguage } from '@/lib/context/LanguageContext';
import { translateMetrics } from '@/lib/ecosystem/i18n';
import { Badge } from '@/components/ui/badge';

export function BusinessDevelopmentClient({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const data = useQuery(api.ecosystem.getBusinessDevelopmentDashboard, { email: userEmail });

  if (data === undefined) {
    return (
      <EcosystemPageLoader
        title={t('ecosystemPages.businessDevelopment.title')}
        subtitle={t('ecosystemPages.businessDevelopment.subtitle')}
      />
    );
  }

  const metrics = translateMetrics(data.metrics, t, 'ecosystemPages.businessDevelopment.metrics');

  return (
    <AppPageShell
      title={t('ecosystemPages.businessDevelopment.title')}
      subtitle={t('ecosystemPages.businessDevelopment.subtitle')}
    >
      <EcosystemSection title={t('ecosystemPages.businessDevelopment.businessMetrics')}>
        <EcosystemMetricGrid stats={metrics} />
      </EcosystemSection>

      <EcosystemSection title={t('ecosystemPages.businessDevelopment.monthlyRevenue')}>
        <EcosystemBarChart data={data.revenueChart} valueSuffix="M" />
      </EcosystemSection>

      <div className="grid gap-8 lg:grid-cols-2">
        <EcosystemSection title={t('ecosystemPages.businessDevelopment.partnersSection')}>
          <EcosystemDataTable
            rows={data.partners}
            emptyMessage={t('ecosystemPages.businessDevelopment.emptyPartners')}
            columns={[
              { key: 'name', header: t('ecosystemPages.shared.table.partner') },
              { key: 'type', header: t('ecosystemPages.shared.table.type') },
              { key: 'referrals', header: t('ecosystemPages.shared.table.referrals') },
              { key: 'revenue', header: t('ecosystemPages.shared.table.revenue') },
              { key: 'commission', header: t('ecosystemPages.shared.table.commission') },
              {
                key: 'status',
                header: t('ecosystemPages.shared.table.status'),
                render: (row) => (
                  <Badge
                    className={
                      row.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }
                  >
                    {row.status === 'active'
                      ? t('ecosystemPages.shared.status.active')
                      : t('ecosystemPages.shared.status.pending')}
                  </Badge>
                ),
              },
            ]}
          />
        </EcosystemSection>

        <EcosystemSection title={t('ecosystemPages.businessDevelopment.referralsSection')}>
          <EcosystemDataTable
            rows={data.referrals}
            emptyMessage={t('ecosystemPages.businessDevelopment.emptyReferrals')}
            columns={[
              { key: 'partner', header: t('ecosystemPages.shared.table.partner') },
              { key: 'student', header: t('ecosystemPages.shared.table.student') },
              { key: 'date', header: t('ecosystemPages.shared.table.date') },
              { key: 'amount', header: t('ecosystemPages.shared.table.amount') },
              {
                key: 'status',
                header: t('ecosystemPages.shared.table.status'),
                render: (row) => (
                  <Badge
                    className={
                      row.status === 'converted'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-white/10'
                    }
                  >
                    {row.status === 'converted'
                      ? t('ecosystemPages.shared.status.converted')
                      : t('ecosystemPages.shared.status.pending')}
                  </Badge>
                ),
              },
            ]}
          />
        </EcosystemSection>
      </div>
    </AppPageShell>
  );
}
