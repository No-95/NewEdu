'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/lib/context/LanguageContext';

export function AcceptConsultationDialog({
  open,
  onOpenChange,
  onConfirm,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (values: {
    scheduledStart: number;
    scheduledEnd: number;
    meetingUrl?: string;
    timezone: string;
  }) => Promise<void>;
  loading?: boolean;
}) {
  const { t } = useLanguage();
  const [dateTime, setDateTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  );
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!dateTime) {
      setError(t('ecosystemPages.careerConsultations.scheduleRequired'));
      return;
    }
    const scheduledStart = new Date(dateTime).getTime();
    if (Number.isNaN(scheduledStart) || scheduledStart <= Date.now()) {
      setError(t('ecosystemPages.careerConsultations.scheduleFuture'));
      return;
    }
    const minutes = Number.parseInt(duration, 10) || 30;
    setError('');
    await onConfirm({
      scheduledStart,
      scheduledEnd: scheduledStart + minutes * 60 * 1000,
      meetingUrl: meetingUrl.trim() || undefined,
      timezone,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('ecosystemPages.careerConsultations.acceptTitle')}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{t('ecosystemPages.careerConsultations.acceptHint')}</p>
        <div className="space-y-4">
          <div>
            <Label>{t('ecosystemPages.careerConsultations.scheduledAt')}</Label>
            <Input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>{t('ecosystemPages.careerConsultations.duration')}</Label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
            >
              <option value="30">30 min</option>
              <option value="60">60 min</option>
            </select>
          </div>
          <div>
            <Label>{t('ecosystemPages.careerConsultations.meetingUrl')}</Label>
            <Input
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="mt-1"
            />
          </div>
          <div>
            <Label>{t('ecosystemPages.careerConsultations.timezone')}</Label>
            <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} className="mt-1" />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('ecosystemPages.shared.cancel')}
          </Button>
          <Button onClick={() => void handleConfirm()} disabled={loading}>
            {loading ? t('ecosystemPages.shared.saving') : t('ecosystemPages.careerConsultations.confirmSchedule')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
