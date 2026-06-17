'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/lib/context/LanguageContext';

type SkillRow = { name: string; level: number };
type EducationRow = { school: string; degree: string; year: string };
type ExperienceRow = { company: string; role: string; period: string; description: string };
type LanguageRow = { name: string; level: string };
type CertificateRow = { name: string; issuer: string; year: string; storageId?: Id<'_storage'> };

function emptySkill(): SkillRow {
  return { name: '', level: 50 };
}
function emptyEducation(): EducationRow {
  return { school: '', degree: '', year: '' };
}
function emptyExperience(): ExperienceRow {
  return { company: '', role: '', period: '', description: '' };
}
function emptyLanguage(): LanguageRow {
  return { name: '', level: '' };
}
function emptyCertificate(): CertificateRow {
  return { name: '', issuer: '', year: '' };
}

const fieldClass =
  'border-border/60 bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40';

function SectionBlock({
  title,
  hint,
  onAdd,
  addLabel,
  children,
}: {
  title: string;
  hint: string;
  onAdd: () => void;
  addLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        </div>
        <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={onAdd}>
          + {addLabel}
        </Button>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function ColumnLabels({ labels }: { labels: string[] }) {
  return (
    <div
      className="hidden gap-2 sm:grid"
      style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr)) auto` }}
    >
      {labels.map((label) => (
        <span key={label} className="px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      ))}
      <span className="w-9" />
    </div>
  );
}

export function CareerProfileEditor({
  userEmail,
  open,
  onOpenChange,
}: {
  userEmail: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useLanguage();
  const profile = useQuery(api.career.getCareerProfileForEdit, open ? { email: userEmail } : 'skip');
  const upsertProfile = useMutation(api.career.upsertCareerProfile);
  const generateUploadUrl = useMutation(api.career.generateCvUploadUrl);
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState<SkillRow[]>([emptySkill()]);
  const [education, setEducation] = useState<EducationRow[]>([emptyEducation()]);
  const [experience, setExperience] = useState<ExperienceRow[]>([emptyExperience()]);
  const [languages, setLanguages] = useState<LanguageRow[]>([emptyLanguage()]);
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingCertIndex, setUploadingCertIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!profile) return;
    setLocation(profile.location ?? '');
    setSkills(profile.skills.length ? profile.skills : [emptySkill()]);
    setEducation(profile.education.length ? profile.education : [emptyEducation()]);
    setExperience(profile.experience.length ? profile.experience : [emptyExperience()]);
    setLanguages(profile.languages.length ? profile.languages : [emptyLanguage()]);
    setCertificates(profile.certificates.length ? profile.certificates : []);
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertProfile({
        email: userEmail,
        location: location || undefined,
        skills: skills.filter((s) => s.name.trim()),
        education: education.filter((e) => e.school.trim()),
        certificates: certificates.filter((c) => c.name.trim()),
        experience: experience.filter((e) => e.company.trim() || e.role.trim()),
        languages: languages.filter((l) => l.name.trim()),
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCertificateUpload = async (index: number, file: File) => {
    setUploadingCertIndex(index);
    try {
      const uploadUrl = await generateUploadUrl({ email: userEmail });
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });
      const { storageId } = (await response.json()) as { storageId: Id<'_storage'> };
      const next = [...certificates];
      next[index] = { ...next[index], storageId };
      setCertificates(next);
    } finally {
      setUploadingCertIndex(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-card sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('ecosystemPages.careerProfile.actions.edit')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <Label htmlFor="career-location" className="text-sm font-semibold text-foreground">
              {t('careerOps.locationLabel')}
            </Label>
            <Input
              id="career-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`mt-2 ${fieldClass}`}
              placeholder={t('careerOps.locationLabel')}
            />
          </div>

          <SectionBlock
            title={t('careerOps.skillsTitle')}
            hint={t('careerOps.skillsHint')}
            addLabel={t('careerOps.addRow')}
            onAdd={() => setSkills([...skills, emptySkill()])}
          >
            <ColumnLabels labels={[t('careerOps.skillName'), t('careerOps.skillLevel')]} />
            {skills.map((skill, index) => (
              <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  aria-label={t('careerOps.skillName')}
                  placeholder={t('careerOps.skillName')}
                  value={skill.name}
                  className={`flex-1 ${fieldClass}`}
                  onChange={(e) => {
                    const next = [...skills];
                    next[index] = { ...skill, name: e.target.value };
                    setSkills(next);
                  }}
                />
                <Input
                  aria-label={t('careerOps.skillLevel')}
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0–100"
                  className={`w-full sm:w-28 ${fieldClass}`}
                  value={skill.level}
                  onChange={(e) => {
                    const next = [...skills];
                    next[index] = { ...skill, level: Number(e.target.value) || 0 };
                    setSkills(next);
                  }}
                />
                {skills.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-muted-foreground"
                    onClick={() => setSkills(skills.filter((_, i) => i !== index))}
                  >
                    {t('careerOps.removeRow')}
                  </Button>
                ) : (
                  <span className="hidden w-9 sm:inline" />
                )}
              </div>
            ))}
          </SectionBlock>

          <SectionBlock
            title={t('careerOps.educationTitle')}
            hint={t('careerOps.educationHint')}
            addLabel={t('careerOps.addRow')}
            onAdd={() => setEducation([...education, emptyEducation()])}
          >
            <ColumnLabels labels={[t('careerOps.school'), t('careerOps.degree'), t('careerOps.year')]} />
            {education.map((row, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_120px_auto] sm:items-center">
                <Input
                  aria-label={t('careerOps.school')}
                  placeholder={t('careerOps.school')}
                  value={row.school}
                  className={fieldClass}
                  onChange={(e) => {
                    const next = [...education];
                    next[index] = { ...row, school: e.target.value };
                    setEducation(next);
                  }}
                />
                <Input
                  aria-label={t('careerOps.degree')}
                  placeholder={t('careerOps.degree')}
                  value={row.degree}
                  className={fieldClass}
                  onChange={(e) => {
                    const next = [...education];
                    next[index] = { ...row, degree: e.target.value };
                    setEducation(next);
                  }}
                />
                <Input
                  aria-label={t('careerOps.year')}
                  placeholder={t('careerOps.year')}
                  value={row.year}
                  className={fieldClass}
                  onChange={(e) => {
                    const next = [...education];
                    next[index] = { ...row, year: e.target.value };
                    setEducation(next);
                  }}
                />
                {education.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => setEducation(education.filter((_, i) => i !== index))}
                  >
                    {t('careerOps.removeRow')}
                  </Button>
                ) : null}
              </div>
            ))}
          </SectionBlock>

          <SectionBlock
            title={t('careerOps.experienceTitle')}
            hint={t('careerOps.experienceHint')}
            addLabel={t('careerOps.addRow')}
            onAdd={() => setExperience([...experience, emptyExperience()])}
          >
            {experience.map((row, index) => (
              <div key={index} className="space-y-3 rounded-lg border border-border/50 bg-background/40 p-3">
                <ColumnLabels labels={[t('careerOps.company'), t('careerOps.role'), t('careerOps.period')]} />
                <div className="grid gap-2 sm:grid-cols-3">
                  <Input
                    aria-label={t('careerOps.company')}
                    placeholder={t('careerOps.company')}
                    value={row.company}
                    className={fieldClass}
                    onChange={(e) => {
                      const next = [...experience];
                      next[index] = { ...row, company: e.target.value };
                      setExperience(next);
                    }}
                  />
                  <Input
                    aria-label={t('careerOps.role')}
                    placeholder={t('careerOps.role')}
                    value={row.role}
                    className={fieldClass}
                    onChange={(e) => {
                      const next = [...experience];
                      next[index] = { ...row, role: e.target.value };
                      setExperience(next);
                    }}
                  />
                  <Input
                    aria-label={t('careerOps.period')}
                    placeholder={t('careerOps.period')}
                    value={row.period}
                    className={fieldClass}
                    onChange={(e) => {
                      const next = [...experience];
                      next[index] = { ...row, period: e.target.value };
                      setExperience(next);
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('careerOps.description')}</Label>
                  <Textarea
                    placeholder={t('careerOps.description')}
                    value={row.description}
                    rows={2}
                    className={`mt-1.5 ${fieldClass}`}
                    onChange={(e) => {
                      const next = [...experience];
                      next[index] = { ...row, description: e.target.value };
                      setExperience(next);
                    }}
                  />
                </div>
                {experience.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => setExperience(experience.filter((_, i) => i !== index))}
                  >
                    {t('careerOps.removeRow')}
                  </Button>
                ) : null}
              </div>
            ))}
          </SectionBlock>

          <SectionBlock
            title={t('careerOps.languagesTitle')}
            hint={t('careerOps.languagesHint')}
            addLabel={t('careerOps.addRow')}
            onAdd={() => setLanguages([...languages, emptyLanguage()])}
          >
            <ColumnLabels labels={[t('careerOps.languageName'), t('careerOps.languageLevel')]} />
            {languages.map((row, index) => (
              <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  aria-label={t('careerOps.languageName')}
                  placeholder={t('careerOps.languageName')}
                  value={row.name}
                  className={`flex-1 ${fieldClass}`}
                  onChange={(e) => {
                    const next = [...languages];
                    next[index] = { ...row, name: e.target.value };
                    setLanguages(next);
                  }}
                />
                <Input
                  aria-label={t('careerOps.languageLevel')}
                  placeholder={t('careerOps.languageLevel')}
                  value={row.level}
                  className={`flex-1 sm:max-w-xs ${fieldClass}`}
                  onChange={(e) => {
                    const next = [...languages];
                    next[index] = { ...row, level: e.target.value };
                    setLanguages(next);
                  }}
                />
                {languages.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-muted-foreground"
                    onClick={() => setLanguages(languages.filter((_, i) => i !== index))}
                  >
                    {t('careerOps.removeRow')}
                  </Button>
                ) : (
                  <span className="hidden w-9 sm:inline" />
                )}
              </div>
            ))}
          </SectionBlock>

          <SectionBlock
            title={t('careerOps.certificatesTitle')}
            hint={t('careerOps.certificatesHint')}
            addLabel={t('careerOps.addRow')}
            onAdd={() => setCertificates([...certificates, emptyCertificate()])}
          >
            {certificates.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('careerOps.certificatesEmpty')}</p>
            ) : (
              certificates.map((row, index) => (
                <div key={index} className="space-y-3 rounded-lg border border-border/50 bg-background/40 p-3">
                  <ColumnLabels labels={[t('careerOps.certificateName'), t('careerOps.issuer'), t('careerOps.year')]} />
                  <div className="grid gap-2 sm:grid-cols-[1fr_1fr_120px_auto] sm:items-center">
                    <Input
                      aria-label={t('careerOps.certificateName')}
                      placeholder={t('careerOps.certificateName')}
                      value={row.name}
                      className={fieldClass}
                      onChange={(e) => {
                        const next = [...certificates];
                        next[index] = { ...row, name: e.target.value };
                        setCertificates(next);
                      }}
                    />
                    <Input
                      aria-label={t('careerOps.issuer')}
                      placeholder={t('careerOps.issuer')}
                      value={row.issuer}
                      className={fieldClass}
                      onChange={(e) => {
                        const next = [...certificates];
                        next[index] = { ...row, issuer: e.target.value };
                        setCertificates(next);
                      }}
                    />
                    <Input
                      aria-label={t('careerOps.year')}
                      placeholder={t('careerOps.year')}
                      value={row.year}
                      className={fieldClass}
                      onChange={(e) => {
                        const next = [...certificates];
                        next[index] = { ...row, year: e.target.value };
                        setCertificates(next);
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => setCertificates(certificates.filter((_, i) => i !== index))}
                    >
                      {t('careerOps.removeRow')}
                    </Button>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-primary hover:underline">
                    {uploadingCertIndex === index
                      ? t('ecosystemPages.aiMatching.uploading')
                      : row.storageId
                        ? t('careerOps.certificateUploaded')
                        : t('careerOps.uploadCertificate')}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleCertificateUpload(index, file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              ))
            )}
          </SectionBlock>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {t('ecosystemPages.common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {t('employerOps.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
