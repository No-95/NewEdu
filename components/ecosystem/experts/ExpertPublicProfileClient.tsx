'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
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
import { useLanguage } from '@/lib/context/LanguageContext';
import { notifyError, notifySuccess } from '@/lib/ui/notify';
import { Badge } from '@/components/ui/badge';

export function ExpertPublicProfileClient({
  expertUserId,
  userEmail,
}: {
  expertUserId: string;
  userEmail?: string;
}) {
  const { t } = useLanguage();
  const expert = useQuery(api.experts.getExpertByUserId, { userId: expertUserId });
  const submitRequest = useMutation(api.experts.submitConsultationRequest);
  const [consultOpen, setConsultOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleConsult = async () => {
    if (!userEmail || !topic.trim()) return;
    setSubmitting(true);
    try {
      await submitRequest({
        requesterEmail: userEmail,
        expertUserId: expertUserId as Id<'users'>,
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
    <div className="min-h-screen bg-background text-foreground">
      <ParticleBackground />
      <Header />
      <main className="relative z-10 px-6 pb-16 pt-24">
        <div className="mx-auto max-w-4xl">
          {expert === undefined ? (
            <p className="text-muted-foreground">{t('ecosystemPages.shared.loading')}</p>
          ) : !expert ? (
            <div className="glass rounded-xl border border-border/50 p-8">
              <h1 className="text-2xl font-bold">{t('ecosystemPages.expertNetwork.profileNotFound')}</h1>
              <Link href="/experts/network" className="mt-4 inline-block text-primary">
                {t('ecosystemPages.expertNetwork.backToNetwork')}
              </Link>
            </div>
          ) : (
            <article className="glass rounded-xl border border-border/50 p-8">
              <h1 className="text-3xl font-bold">{expert.displayName}</h1>
              <p className="mt-2 text-primary">{expert.headline}</p>
              {expert.bio ? <p className="mt-4 text-muted-foreground">{expert.bio}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {expert.expertise.map((tag) => (
                  <Badge key={tag} className="bg-primary/20 text-primary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                {userEmail ? (
                  <Button onClick={() => setConsultOpen(true)}>
                    {t('ecosystemPages.expertNetwork.actions.bookConsultation')}
                  </Button>
                ) : (
                  <Link href={`/auth?mode=signin&redirect=/experts/${expertUserId}`} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">
                    {t('ecosystemPages.expertNetwork.signInToBook')}
                  </Link>
                )}
                <Link href="/experts/network" className="rounded-lg border border-border px-4 py-2 text-sm">
                  {t('ecosystemPages.expertNetwork.backToNetwork')}
                </Link>
              </div>
            </article>
          )}
        </div>
      </main>

      <Dialog open={consultOpen} onOpenChange={setConsultOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('ecosystemPages.expertNetwork.consultationTitle')}</DialogTitle>
          </DialogHeader>
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
    </div>
  );
}
