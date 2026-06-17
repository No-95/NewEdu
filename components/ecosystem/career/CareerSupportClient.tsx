'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { useLanguage } from '@/lib/context/LanguageContext';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export function CareerSupportClient({
  userEmail,
  defaultFullName,
  defaultPhone,
}: {
  userEmail: string;
  defaultFullName?: string;
  defaultPhone?: string;
}) {
  const { t } = useLanguage();
  const history = useQuery(api.contact.listContactSubmissionsByEmail, {
    email: userEmail,
    roleFilter: 'career',
  });
  const experts = useQuery(api.experts.listPublishedExperts, {});
  const submitConsultation = useMutation(api.experts.submitConsultationRequest);
  const submitContactSubmission = useMutation(api.contact.submitContactSubmission);
  const [service, setService] = useState('');
  const [expertId, setExpertId] = useState('');
  const [notes, setNotes] = useState('');
  const [fullName, setFullName] = useState(defaultFullName ?? '');
  const [email, setEmail] = useState(userEmail);
  const [phone, setPhone] = useState(defaultPhone ?? '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const handleBooking = async () => {
    if (!service.trim() || !expertId || !fullName.trim() || !email.trim() || !phone.trim()) {
      setError(t('ecosystemPages.careerSupport.bookingValidation'));
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await submitConsultation({
        requesterEmail: userEmail,
        expertUserId: expertId as Id<'users'>,
        topic: service.trim(),
        message: notes.trim() || 'Career support request via career support page.',
      });
      setSuccess(t('ecosystemPages.careerSupport.consultationSubmitted'));
      setService('');
      setExpertId('');
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGeneralInquiry = async () => {
    if (!service.trim() || !fullName.trim() || !email.trim() || !phone.trim()) {
      setError(t('ecosystemPages.careerSupport.bookingValidation'));
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await submitContactSubmission({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: 'career_support',
        organization: 'HDP EDU Career Support',
        feedback: [service.trim(), notes.trim()].filter(Boolean).join('\n'),
      });
      setSuccess(t('ecosystemPages.careerSupport.bookingSuccess'));
    } finally {
      setSubmitting(false);
    }
  };

  const upcoming = (history ?? []).filter((entry) => entry.status === 'new').slice(0, 5);
  const past = (history ?? []).filter((entry) => entry.status !== 'new').slice(0, 8);

  return (
    <AppPageShell
      title={t('ecosystemPages.careerSupport.title')}
      subtitle={t('ecosystemPages.careerSupport.subtitle')}
    >
      <p className="mb-6 text-sm text-muted-foreground">
        {t('ecosystemPages.careerSupport.scheduleHint')}{' '}
        <Link href="/career/consultations" className="font-medium text-primary hover:underline">
          {t('ecosystemPages.careerSupport.viewConsultations')}
        </Link>
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        <EcosystemSection title={t('ecosystemPages.careerSupport.bookSection')}>
          <div className="home-card space-y-4">
            <div>
              <Label>{t('ecosystemPages.careerSupport.selectService')}</Label>
              <Input value={service} onChange={(e) => setService(e.target.value)} placeholder={t('ecosystemPages.careerSupport.servicePlaceholder')} className="mt-1.5 border-white/10 bg-white/5" />
            </div>
            <div>
              <Label>{t('ecosystemPages.careerSupport.selectExpert')}</Label>
              <select
                value={expertId}
                onChange={(e) => setExpertId(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground"
              >
                <option value="">{t('ecosystemPages.careerSupport.expertPlaceholder')}</option>
                {(experts ?? []).map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.displayName} — {entry.headline}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>{t('ecosystemPages.careerSupport.notes')}</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('ecosystemPages.careerSupport.notesPlaceholder')} rows={3} className="mt-1.5 border-white/10 bg-white/5" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{t('ecosystemPages.shared.table.name')}</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1.5 border-white/10 bg-white/5" />
              </div>
              <div>
                <Label>{t('ecosystemPages.shared.table.phone')}</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5 border-white/10 bg-white/5" />
              </div>
            </div>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-400">{success}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void handleBooking()} disabled={submitting || !expertId}>
                {submitting ? t('ecosystemPages.shared.saving') : t('ecosystemPages.careerSupport.requestConsultation')}
              </Button>
              <Button variant="outline" onClick={() => void handleGeneralInquiry()} disabled={submitting}>
                {t('ecosystemPages.careerSupport.generalInquiry')}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/experts/network">{t('ecosystemPages.careerSupport.browseNetwork')}</Link>
              </Button>
            </div>
          </div>
        </EcosystemSection>

        <EcosystemSection title={t('ecosystemPages.careerSupport.historySection')}>
          {upcoming.length > 0 ? (
            <ul className="mb-6 space-y-2">
              {upcoming.map((entry) => (
                <li key={entry.id} className="home-card-muted flex items-center justify-between p-3 text-sm">
                  <span>{entry.feedback.slice(0, 80)}</span>
                  <Badge className="bg-primary/20 text-primary">{entry.status}</Badge>
                </li>
              ))}
            </ul>
          ) : null}
          {past.length > 0 ? (
            <ul className="space-y-2">
              {past.map((entry) => (
                <li key={entry.id} className="home-card-muted p-3 text-sm text-muted-foreground">
                  {entry.feedback.slice(0, 120)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{t('ecosystemPages.careerSupport.emptyHistory')}</p>
          )}
        </EcosystemSection>
      </div>
    </AppPageShell>
  );
}
