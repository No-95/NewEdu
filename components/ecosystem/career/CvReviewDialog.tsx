'use client';

import { useEffect, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
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
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/lib/context/LanguageContext';

type CvDraft = {
  location?: string;
  education: { school: string; degree: string; year: string }[];
  skills: { name: string; level: number }[];
  certificates: { name: string; issuer: string; year: string }[];
  experience: { company: string; role: string; period: string; description: string }[];
  languages: { name: string; level: string }[];
};

export function CvReviewDialog({
  userEmail,
  open,
  draft,
  onOpenChange,
  onApplied,
}: {
  userEmail: string;
  open: boolean;
  draft: CvDraft | null;
  onOpenChange: (open: boolean) => void;
  onApplied?: () => void;
}) {
  const { t } = useLanguage();
  const applyDraft = useMutation(api.career.applyCvDraftToProfile);
  const saveDraft = useMutation(api.career.completeCvParseDraft);
  const [form, setForm] = useState<CvDraft | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (draft) setForm(draft);
  }, [draft]);

  const current = form ?? draft;
  if (!current) return null;

  const handleApply = async () => {
    if (!current) return;
    setApplying(true);
    try {
      await saveDraft({ email: userEmail, draft: current });
      await applyDraft({ email: userEmail });
      onOpenChange(false);
      onApplied?.();
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('ecosystemPages.aiMatching.reviewCvTitle')}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{t('ecosystemPages.aiMatching.reviewCvHint')}</p>

        <div className="space-y-4">
          <div>
            <Label>{t('employerOps.location')}</Label>
            <Input
              value={current.location ?? ''}
              onChange={(e) => setForm({ ...current, location: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>{t('ecosystemPages.careerProfile.skillsSection')}</Label>
            <Textarea
              className="mt-1 font-mono text-xs"
              rows={4}
              value={current.skills.map((s) => `${s.name} (${s.level}/5)`).join('\n')}
              onChange={(e) => {
                const skills = e.target.value
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line) => {
                    const match = line.match(/^(.+?)\s*\((\d)\/5\)$/);
                    if (match) return { name: match[1].trim(), level: Number(match[2]) };
                    return { name: line.replace(/\(\d\/5\)$/, '').trim(), level: 3 };
                  });
                setForm({ ...current, skills });
              }}
            />
          </div>

          <div>
            <Label>{t('ecosystemPages.careerProfile.experienceSection')}</Label>
            <ul className="mt-2 space-y-2 text-sm">
              {current.experience.map((exp, i) => (
                <li key={`${exp.company}-${i}`} className="home-card-muted p-2">
                  <p className="font-medium">{exp.role}</p>
                  <p className="text-muted-foreground">
                    {exp.company} · {exp.period}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('ecosystemPages.shared.cancel')}
          </Button>
          <Button onClick={() => void handleApply()} disabled={applying}>
            {applying ? t('ecosystemPages.aiMatching.applyingCv') : t('ecosystemPages.aiMatching.applyCvToProfile')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
