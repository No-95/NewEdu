'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { EcosystemDataTable } from '@/components/ecosystem/shared/EcosystemDataTable';
import { EcosystemPageLoader } from '@/components/ecosystem/shared/EcosystemPageLoader';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Badge } from '@/components/ui/badge';

export function ApplicationsClient({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const router = useRouter();
  const applications = useQuery(api.employerOps.listApplicationsForUser, { email: userEmail });

  if (applications === undefined) {
    return (
      <EcosystemPageLoader
        title={t('ecosystemPages.careerApplications.title')}
        subtitle={t('ecosystemPages.careerApplications.subtitle')}
      />
    );
  }

  return (
    <AppPageShell
      title={t('ecosystemPages.careerApplications.title')}
      subtitle={t('ecosystemPages.careerApplications.subtitle')}
    >
      <EcosystemSection title={t('ecosystemPages.careerApplications.listSection')}>
        <EcosystemDataTable
          rows={applications}
          emptyMessage={t('ecosystemPages.careerApplications.empty')}
          onRowClick={(row) => router.push(`/career/applications/${row.id}`)}
          columns={[
            { key: 'jobTitle', header: t('ecosystemPages.shared.table.title') },
            { key: 'companyName', header: t('ecosystemPages.shared.table.partner') },
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
              key: 'appliedAt',
              header: t('ecosystemPages.shared.table.date'),
              render: (row) => new Date(row.appliedAt).toLocaleDateString(),
            },
          ]}
        />
      </EcosystemSection>
    </AppPageShell>
  );
}
