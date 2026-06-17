'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { EcosystemDataTable } from '@/components/ecosystem/shared/EcosystemDataTable';
import { EcosystemPageLoader } from '@/components/ecosystem/shared/EcosystemPageLoader';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function ConsultationsClient({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const requests = useQuery(api.experts.listRequestsForRequester, { email: userEmail });

  if (requests === undefined) {
    return (
      <EcosystemPageLoader
        title={t('ecosystemPages.careerConsultations.title')}
        subtitle={t('ecosystemPages.careerConsultations.subtitle')}
      />
    );
  }

  return (
    <AppPageShell
      title={t('ecosystemPages.careerConsultations.title')}
      subtitle={t('ecosystemPages.careerConsultations.subtitle')}
    >
      <EcosystemSection title={t('ecosystemPages.careerConsultations.listSection')}>
        <EcosystemDataTable
          rows={requests}
          emptyMessage={t('ecosystemPages.careerConsultations.empty')}
          columns={[
            { key: 'topic', header: t('ecosystemPages.shared.table.subject') },
            { key: 'expertName', header: t('ecosystemPages.shared.table.name') },
            {
              key: 'status',
              header: t('ecosystemPages.shared.table.status'),
              render: (row) => (
                <Badge
                  className={
                    row.status === 'accepted'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : row.status === 'closed'
                        ? 'bg-white/10'
                        : 'bg-primary/20 text-primary'
                  }
                >
                  {t(`ecosystemPages.careerConsultations.status.${row.status}`)}
                </Badge>
              ),
            },
            {
              key: 'scheduledStart',
              header: t('ecosystemPages.careerConsultations.scheduledAt'),
              render: (row) =>
                row.scheduledStart
                  ? new Date(row.scheduledStart).toLocaleString(undefined, {
                      timeZone: row.timezone || undefined,
                    })
                  : '—',
            },
            {
              key: 'meetingUrl',
              header: t('ecosystemPages.careerConsultations.meetingUrl'),
              render: (row) =>
                row.meetingUrl ? (
                  <Button asChild size="sm" variant="outline">
                    <a href={row.meetingUrl} target="_blank" rel="noopener noreferrer">
                      {t('ecosystemPages.careerConsultations.joinMeeting')}
                    </a>
                  </Button>
                ) : (
                  '—'
                ),
            },
            {
              key: 'createdAt',
              header: t('ecosystemPages.shared.table.date'),
              render: (row) => new Date(row.createdAt).toLocaleDateString(),
            },
          ]}
        />
      </EcosystemSection>
      <p className="mt-6 text-sm text-muted-foreground">
        <Link href="/experts/network" className="font-medium text-primary hover:underline">
          {t('ecosystemPages.careerConsultations.browseExperts')} →
        </Link>
      </p>
    </AppPageShell>
  );
}
