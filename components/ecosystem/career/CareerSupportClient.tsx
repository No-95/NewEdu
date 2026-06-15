'use client';

import { useState } from 'react';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { CAREER_EXPERTS, CAREER_SERVICES, MOCK_SESSIONS } from '@/lib/ecosystem/mock-data';
import { useLanguage } from '@/lib/context/LanguageContext';
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
  const [service, setService] = useState('');
  const [expert, setExpert] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

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
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {t('ecosystemPages.careerSupport.confirmBooking')}
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
