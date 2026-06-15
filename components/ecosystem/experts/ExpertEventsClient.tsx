'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemFilterBar } from '@/components/ecosystem/shared/EcosystemFilterBar';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { EVENT_CATEGORY_LABELS, MOCK_EVENTS } from '@/lib/ecosystem/mock-data';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Video } from 'lucide-react';
import { buildContactHref } from '@/lib/utils/client-actions';

export function ExpertEventsClient() {
  const { t } = useLanguage();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    return MOCK_EVENTS.filter((ev) => {
      const matchSearch =
        !search || ev.title.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'all' || ev.category === category;
      return matchSearch && matchCategory;
    });
  }, [search, category]);

  return (
    <AppPageShell
      title={t('ecosystemPages.expertEvents.title')}
      subtitle={t('ecosystemPages.expertEvents.subtitle')}
    >
      <EcosystemFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('ecosystemPages.expertEvents.searchPlaceholder')}
        filters={[
          {
            key: 'category',
            label: t('ecosystemPages.expertEvents.typeFilter'),
            options: [
              { value: 'all', label: t('ecosystemPages.shared.all') },
              { value: 'webinar', label: EVENT_CATEGORY_LABELS.webinar },
              { value: 'workshop', label: EVENT_CATEGORY_LABELS.workshop },
              { value: 'trade_forum', label: EVENT_CATEGORY_LABELS.trade_forum },
              { value: 'networking', label: EVENT_CATEGORY_LABELS.networking },
            ],
          },
        ]}
        filterValues={{ category }}
        onFilterChange={(_, v) => setCategory(v)}
      />

      <EcosystemSection title={t('ecosystemPages.expertEvents.scheduleSection')} className="mt-6">
        <div className="grid gap-5">
          {filtered.map((event) => (
            <div key={event.id} className="home-card">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-primary/20 text-primary">
                      {EVENT_CATEGORY_LABELS[event.category]}
                    </Badge>
                    {event.isOnline && (
                      <Badge variant="secondary" className="bg-white/10">
                        <Video className="mr-1 h-3 w-3" /> {t('ecosystemPages.shared.online')}
                      </Badge>
                    )}
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-foreground">{event.title}</h3>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{event.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{event.time}</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {event.registered}/{event.capacity} {t('ecosystemPages.shared.registered')}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {t('ecosystemPages.shared.speakers')} {event.speakers.join(', ')}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    if (event.isOnline) {
                      router.push('/events/vietnam-korea-career-connect-webinar-june-2026');
                      return;
                    }
                    router.push(
                      buildContactHref({
                        topic: 'event-registration',
                        role: 'expert_events',
                        message: `Register for: ${event.title} (${event.date} ${event.time})`,
                      })
                    );
                  }}
                  className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {t('ecosystemPages.expertEvents.register')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </EcosystemSection>
    </AppPageShell>
  );
}
