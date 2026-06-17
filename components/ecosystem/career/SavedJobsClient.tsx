'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { EcosystemPageLoader } from '@/components/ecosystem/shared/EcosystemPageLoader';
import { useLanguage } from '@/lib/context/LanguageContext';

export function SavedJobsClient({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const savedJobs = useQuery(api.employerOps.listSavedJobsForUser, { email: userEmail });

  if (savedJobs === undefined) {
    return (
      <EcosystemPageLoader
        title={t('ecosystemPages.savedJobs.title')}
        subtitle={t('ecosystemPages.savedJobs.subtitle')}
      />
    );
  }

  return (
    <AppPageShell
      title={t('ecosystemPages.savedJobs.title')}
      subtitle={t('ecosystemPages.savedJobs.subtitle')}
    >
      <EcosystemSection title={t('ecosystemPages.savedJobs.listSection')}>
        {savedJobs.length > 0 ? (
          <ul className="space-y-2">
            {savedJobs.map((job) => (
              <li key={job.id} className="home-card-muted flex items-center justify-between p-3">
                <div>
                  <Link href={`/jobs/${job.externalId}`} className="font-medium text-primary hover:underline">
                    {job.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">{job.department}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t('ecosystemPages.savedJobs.empty')}</p>
        )}
      </EcosystemSection>
    </AppPageShell>
  );
}
