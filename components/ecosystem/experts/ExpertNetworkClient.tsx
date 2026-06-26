'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConvex, useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemFilterBar } from '@/components/ecosystem/shared/EcosystemFilterBar';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { useLanguage } from '@/lib/context/LanguageContext';
import { openMessengerWithUser } from '@/lib/messenger/events';
import { notifyError, notifySuccess } from '@/lib/ui/notify';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, MessageCircle } from 'lucide-react';

function expertInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(-2)
    .join('')
    .toUpperCase();
}

export function ExpertNetworkClient({ userEmail }: { userEmail?: string }) {
  const { t } = useLanguage();
  const router = useRouter();
  const convex = useConvex();
  const experts = useQuery(api.experts.listPublishedExperts, {});
  const submitRequest = useMutation(api.experts.submitConsultationRequest);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('all');
  const [consultOpen, setConsultOpen] = useState(false);
  const [selectedExpertId, setSelectedExpertId] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [messagingExpertId, setMessagingExpertId] = useState<string | null>(null);

  const industries = useMemo(() => {
    const set = new Set<string>();
    (experts ?? []).forEach((ex) => ex.industries.forEach((i) => set.add(i)));
    return Array.from(set);
  }, [experts]);

  const filtered = useMemo(() => {
    return (experts ?? []).filter((ex) => {
      const matchSearch =
        !search ||
        ex.displayName.toLowerCase().includes(search.toLowerCase()) ||
        ex.expertise.some((e) => e.toLowerCase().includes(search.toLowerCase()));
      const matchIndustry = industry === 'all' || ex.industries.includes(industry);
      return matchSearch && matchIndustry;
    });
  }, [experts, search, industry]);

  const openExpertMessenger = async (expertId: string) => {
    if (!userEmail) {
      router.push(`/auth?mode=signin&redirect=${encodeURIComponent(`/experts/network?messageExpert=${expertId}`)}`);
      return;
    }

    setMessagingExpertId(expertId);
    try {
      const contact = await convex.query(api.experts.getExpertMessagingContact, {
        requesterEmail: userEmail,
        expertUserId: expertId,
      });
      if (!contact) {
        notifyError(t('ecosystemPages.expertNetwork.messageFailed'));
        return;
      }
      openMessengerWithUser({
        email: contact.email,
        fullName: contact.displayName,
        avatarUrl: contact.avatarUrl,
      });
    } catch (err) {
      notifyError(
        t('ecosystemPages.expertNetwork.messageFailed'),
        err instanceof Error ? err.message : undefined
      );
    } finally {
      setMessagingExpertId(null);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const expertId = params.get('messageExpert');
    if (!expertId || !userEmail) return;

    params.delete('messageExpert');
    const nextQuery = params.toString();
    router.replace(nextQuery ? `/experts/network?${nextQuery}` : '/experts/network');

    void openExpertMessenger(expertId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when returning from auth with messageExpert
  }, [userEmail]);

  const handleConsult = async () => {
    if (!userEmail || !selectedExpertId || !topic.trim()) return;
    setSubmitting(true);
    try {
      await submitRequest({
        requesterEmail: userEmail,
        expertUserId: selectedExpertId as Id<'users'>,
        topic,
        message,
      });
      setConsultOpen(false);
      setTopic('');
      setMessage('');
      notifySuccess(t('ecosystemPages.expertNetwork.consultationSuccess'));
    } catch (err) {
      notifyError(
        t('ecosystemPages.expertNetwork.consultationFailed'),
        err instanceof Error ? err.message : undefined
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppPageShell
      pageClassName="experts-network-page"
      title={t('ecosystemPages.expertNetwork.title')}
      subtitle={t('ecosystemPages.expertNetwork.subtitle')}
    >
      <EcosystemFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('ecosystemPages.expertNetwork.searchPlaceholder')}
        filters={[
          {
            key: 'industry',
            label: t('ecosystemPages.expertNetwork.filters.industry'),
            options: [
              { value: 'all', label: t('ecosystemPages.shared.all') },
              ...industries.map((value) => ({ value, label: value })),
            ],
          },
        ]}
        filterValues={{ industry }}
        onFilterChange={(key, value) => {
          if (key === 'industry') setIndustry(value);
        }}
      />

      <EcosystemSection
        title={t('ecosystemPages.expertNetwork.expertsCount', { params: { count: filtered.length } })}
        className="mt-6"
      >
        {experts === undefined ? (
          <p className="text-sm text-muted-foreground">{t('ecosystemPages.shared.loading')}</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('ecosystemPages.expertNetwork.emptyExperts')}</p>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {filtered.map((expert) => (
              <div key={expert.id} className="home-card">
                <div className="flex items-start gap-4">
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-2 ring-primary/20">
                    {expertInitials(expert.displayName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className="text-left text-lg font-semibold text-foreground hover:text-primary"
                        onClick={() => router.push(`/experts/${expert.id}`)}
                      >
                        {expert.displayName}
                      </button>
                      {expert.verified ? (
                        <Badge className="bg-emerald-500/15 text-emerald-400">
                          {t('ecosystemPages.expertNetwork.verified')}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-primary">{expert.headline}</p>
                  </div>
                </div>
                {expert.bio ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{expert.bio}</p> : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {expert.expertise.map((e) => (
                    <Badge key={e} variant="secondary" className="experts-badge border-border bg-muted/80 text-foreground">
                      {e}
                    </Badge>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={messagingExpertId === expert.id}
                    onClick={() => void openExpertMessenger(expert.id)}
                  >
                    <MessageCircle className="mr-1 h-4 w-4" />
                    {messagingExpertId === expert.id
                      ? t('ecosystemPages.expertNetwork.actions.openingMessage')
                      : t('ecosystemPages.expertNetwork.actions.message')}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (!userEmail) {
                        router.push('/auth?mode=signin&redirect=/experts/network');
                        return;
                      }
                      setSelectedExpertId(expert.id);
                      setConsultOpen(true);
                    }}
                  >
                    <Calendar className="mr-1 h-4 w-4" /> {t('ecosystemPages.expertNetwork.actions.bookConsultation')}
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => router.push(`/experts/${expert.id}`)}>
                    {t('ecosystemPages.expertNetwork.actions.viewProfile')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </EcosystemSection>

      <Dialog open={consultOpen} onOpenChange={setConsultOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('ecosystemPages.expertNetwork.consultationTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t('ecosystemPages.expertNetwork.consultationScheduleHint')}
          </p>
          <div className="space-y-3">
            <div>
              <Label>{t('ecosystemPages.expertNetwork.consultationTopic')}</Label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
            <div>
              <Label>{t('ecosystemPages.expertNetwork.consultationMessage')}</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleConsult} disabled={submitting || !topic.trim()}>
              {t('ecosystemPages.expertNetwork.actions.sendRequest')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppPageShell>
  );
}
