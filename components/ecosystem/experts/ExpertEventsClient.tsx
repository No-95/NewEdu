'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemFilterBar } from '@/components/ecosystem/shared/EcosystemFilterBar';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

export function ExpertEventsClient() {
  const { t } = useLanguage();
  const events = useQuery(api.experts.listExpertEvents, {});
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return (events ?? []).filter((ev) => !search || ev.title.toLowerCase().includes(search.toLowerCase()));
  }, [events, search]);

  return (
    <AppPageShell
      title={t('ecosystemPages.expertEvents.title')}
      subtitle={t('ecosystemPages.expertEvents.subtitle')}
    >
      <EcosystemFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('ecosystemPages.expertEvents.searchPlaceholder')}
        filters={[]}
        filterValues={{}}
        onFilterChange={() => {}}
      />

      <EcosystemSection title={t('ecosystemPages.expertEvents.scheduleSection')} className="mt-6">
        {events === undefined ? (
          <p className="text-sm text-muted-foreground">{t('ecosystemPages.shared.loading')}</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('ecosystemPages.expertEvents.emptyEvents')}</p>
        ) : (
          <div className="grid gap-5">
            {filtered.map((event) => (
              <div key={event.id} className="home-card">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <Badge className="bg-primary/20 text-primary">{t('ecosystemPages.shared.events')}</Badge>
                    <h3 className="mt-2 text-xl font-semibold text-foreground">{event.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{event.excerpt}</p>
                    <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.publishedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Link
                    href={`/events/${event.slug}`}
                    className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    {t('ecosystemPages.expertEvents.viewDetails')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </EcosystemSection>
    </AppPageShell>
  );
}
