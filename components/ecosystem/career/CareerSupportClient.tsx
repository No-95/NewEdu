'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { CAREER_EXPERTS, CAREER_SERVICES, MOCK_SESSIONS } from '@/lib/ecosystem/mock-data';
import { useLanguage } from '@/lib/context/LanguageContext';
import { api } from '@/convex/_generated/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function CareerSupportClient() {
  const { t } = useLanguage();
  const router = useRouter();
  const submitContactSubmission = useMutation(api.contact.submitContactSubmission);
  const [service, setService] = useState('');
  const [expert, setExpert] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const selectedService = CAREER_SERVICES.find((item) => item.id === service);
  const selectedExpert = CAREER_EXPERTS.find((item) => item.id === expert);

  const handleBooking = async () => {
    if (!service || !expert || !date || !time || !fullName.trim() || !email.trim() || !phone.trim()) {
      setError(t('ecosystemPages.careerSupport.bookingValidation') || 'Please complete all booking fields.');
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
        feedback: [
          'Career support booking request',
          `Service: ${selectedService?.name ?? service}`,
          `Expert: ${selectedExpert?.name ?? expert}`,
          `Date: ${date}`,
          `Time: ${time}`,
        ].join('\n'),
      });
      setSuccess(t('ecosystemPages.careerSupport.bookingSuccess') || 'Booking request submitted. We will confirm by email.');
      setService('');
      setExpert('');
      setDate('');
      setTime('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppPageShell
      title={t('ecosystemPages.careerSupport.title')}
      subtitle={t('ecosystemPages.careerSupport.subtitle')}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <EcosystemSection title={t('ecosystemPages.careerSupport.bookSection')}>
          <div className="home-card space-y-4">
            <div>
              <Label>{t('ecosystemPages.careerSupport.selectService')}</Label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger className="mt-1.5 border-white/10 bg-white/5">
                  <SelectValue placeholder={t('ecosystemPages.careerSupport.selectService')} />
                </SelectTrigger>
                <SelectContent>
                  {CAREER_SERVICES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} — {s.price}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('ecosystemPages.careerSupport.selectExpert')}</Label>
              <Select value={expert} onValueChange={setExpert}>
                <SelectTrigger className="mt-1.5 border-white/10 bg-white/5">
                  <SelectValue placeholder={t('ecosystemPages.careerSupport.selectExpert')} />
                </SelectTrigger>
                <SelectContent>
                  {CAREER_EXPERTS.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name} — {e.specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{t('ecosystemPages.careerSupport.date')}</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5 border-white/10 bg-white/5" />
              </div>
              <div>
                <Label>{t('ecosystemPages.careerSupport.time')}</Label>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1.5 border-white/10 bg-white/5" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{t('contactUsPage.fullName')}</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1.5 border-white/10 bg-white/5" />
              </div>
              <div>
                <Label>{t('contactUsPage.phone')}</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5 border-white/10 bg-white/5" />
              </div>
            </div>
            <div>
              <Label>{t('contactUsPage.email')}</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 border-white/10 bg-white/5" />
            </div>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-400">{success}</p> : null}
            <Button
              type="button"
              onClick={handleBooking}
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {submitting ? t('contactUsPage.submitting') || 'Submitting...' : t('ecosystemPages.careerSupport.confirmBooking')}
            </Button>
            <Button type="button" variant="outline" className="w-full border-white/15" onClick={() => router.push('/events')}>
              {t('eventsPage.title')}
            </Button>
          </div>

          <div className="mt-6 grid gap-3">
            {CAREER_SERVICES.map((s) => (
              <div key={s.id} className="home-card-muted">
                <p className="font-semibold">{s.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                <p className="mt-2 text-xs text-primary">{s.duration} · {s.price}</p>
              </div>
            ))}
          </div>
        </EcosystemSection>

        <div>
          <EcosystemSection title={t('ecosystemPages.careerSupport.upcomingSection')}>
            {MOCK_SESSIONS.filter((s) => s.status === 'upcoming').map((sess) => (
              <div key={sess.id} className="home-card-muted mb-3">
                <div className="flex justify-between">
                  <p className="font-semibold">{sess.service}</p>
                  <Badge className="bg-primary/20 text-primary">
                    {t('ecosystemPages.shared.status.upcoming')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{sess.expert}</p>
                <p className="mt-1 text-sm text-primary">{sess.date} · {sess.time}</p>
              </div>
            ))}
          </EcosystemSection>

          <EcosystemSection title={t('ecosystemPages.careerSupport.historySection')}>
            {MOCK_SESSIONS.filter((s) => s.status === 'completed').map((sess) => (
              <div key={sess.id} className="home-card-muted mb-3">
                <p className="font-semibold">{sess.service}</p>
                <p className="text-sm text-muted-foreground">{sess.expert} · {sess.date}</p>
                <Badge variant="secondary" className="mt-2 bg-white/10">
                  {t('ecosystemPages.shared.status.completed')}
                </Badge>
              </div>
            ))}
          </EcosystemSection>
        </div>
      </div>
    </AppPageShell>
  );
}
