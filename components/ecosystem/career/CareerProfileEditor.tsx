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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('ecosystemPages.careerProfile.actions.edit')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <Label>{t('employerOps.location')}</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1" />
          </div>

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('careerOps.skillsHint')}</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setSkills([...skills, emptySkill()])}>
                + Add
              </Button>
            </div>
            {skills.map((skill, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Skill name"
                  value={skill.name}
                  onChange={(e) => {
                    const next = [...skills];
                    next[index] = { ...skill, name: e.target.value };
                    setSkills(next);
                  }}
                />
                <Input
                  type="number"
                  min={0}
                  max={100}
                  className="w-24"
                  value={skill.level}
                  onChange={(e) => {
                    const next = [...skills];
                    next[index] = { ...skill, level: Number(e.target.value) || 0 };
                    setSkills(next);
                  }}
                />
                {skills.length > 1 ? (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setSkills(skills.filter((_, i) => i !== index))}>
                    ×
                  </Button>
                ) : null}
              </div>
            ))}
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('careerOps.educationHint')}</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setEducation([...education, emptyEducation()])}>
                + Add
              </Button>
            </div>
            {education.map((row, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-3">
                <Input placeholder="School" value={row.school} onChange={(e) => {
                  const next = [...education]; next[index] = { ...row, school: e.target.value }; setEducation(next);
                }} />
                <Input placeholder="Degree" value={row.degree} onChange={(e) => {
                  const next = [...education]; next[index] = { ...row, degree: e.target.value }; setEducation(next);
                }} />
                <div className="flex gap-2">
                  <Input placeholder="Year" value={row.year} onChange={(e) => {
                    const next = [...education]; next[index] = { ...row, year: e.target.value }; setEducation(next);
                  }} />
                  {education.length > 1 ? (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEducation(education.filter((_, i) => i !== index))}>×</Button>
                  ) : null}
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('careerOps.experienceHint')}</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setExperience([...experience, emptyExperience()])}>
                + Add
              </Button>
            </div>
            {experience.map((row, index) => (
              <div key={index} className="space-y-2 rounded-lg border border-border/50 p-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  <Input placeholder="Company" value={row.company} onChange={(e) => {
                    const next = [...experience]; next[index] = { ...row, company: e.target.value }; setExperience(next);
                  }} />
                  <Input placeholder="Role" value={row.role} onChange={(e) => {
                    const next = [...experience]; next[index] = { ...row, role: e.target.value }; setExperience(next);
                  }} />
                  <Input placeholder="Period" value={row.period} onChange={(e) => {
                    const next = [...experience]; next[index] = { ...row, period: e.target.value }; setExperience(next);
                  }} />
                </div>
                <Textarea placeholder="Description" value={row.description} rows={2} onChange={(e) => {
                  const next = [...experience]; next[index] = { ...row, description: e.target.value }; setExperience(next);
                }} />
                {experience.length > 1 ? (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setExperience(experience.filter((_, i) => i !== index))}>Remove</Button>
                ) : null}
              </div>
            ))}
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('careerOps.languagesHint')}</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setLanguages([...languages, emptyLanguage()])}>
                + Add
              </Button>
            </div>
            {languages.map((row, index) => (
              <div key={index} className="flex gap-2">
                <Input placeholder="Language" value={row.name} onChange={(e) => {
                  const next = [...languages]; next[index] = { ...row, name: e.target.value }; setLanguages(next);
                }} />
                <Input placeholder="Level" value={row.level} onChange={(e) => {
                  const next = [...languages]; next[index] = { ...row, level: e.target.value }; setLanguages(next);
                }} />
                {languages.length > 1 ? (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setLanguages(languages.filter((_, i) => i !== index))}>×</Button>
                ) : null}
              </div>
            ))}
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('careerOps.certificatesHint')}</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setCertificates([...certificates, emptyCertificate()])}>
                + Add
              </Button>
            </div>
            {certificates.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('careerOps.certificatesEmpty')}</p>
            ) : (
              certificates.map((row, index) => (
                <div key={index} className="space-y-2 rounded-lg border border-border/50 p-3">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Input placeholder="Certificate" value={row.name} onChange={(e) => {
                      const next = [...certificates]; next[index] = { ...row, name: e.target.value }; setCertificates(next);
                    }} />
                    <Input placeholder="Issuer" value={row.issuer} onChange={(e) => {
                      const next = [...certificates]; next[index] = { ...row, issuer: e.target.value }; setCertificates(next);
                    }} />
                    <div className="flex gap-2">
                      <Input placeholder="Year" value={row.year} onChange={(e) => {
                        const next = [...certificates]; next[index] = { ...row, year: e.target.value }; setCertificates(next);
                      }} />
                      <Button type="button" variant="ghost" size="sm" onClick={() => setCertificates(certificates.filter((_, i) => i !== index))}>×</Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer text-xs font-medium text-primary hover:underline">
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
                </div>
              ))
            )}
          </section>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={saving}>
            {t('employerOps.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
