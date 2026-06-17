'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { EcosystemPageLoader } from '@/components/ecosystem/shared/EcosystemPageLoader';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StageHistoryTimeline } from '@/components/ecosystem/shared/StageHistoryTimeline';

export function CandidateDetailClient({
  userEmail,
  candidateId,
}: {
  userEmail: string;
  candidateId: string;
}) {
  const { t } = useLanguage();
  const candidate = useQuery(api.employerOps.getCandidateDetail, {
    email: userEmail,
    candidateId: candidateId as Id<'recruitmentCandidates'>,
  });
  const advanceCandidate = useMutation(api.employerOps.advanceCandidateStage);
  const rejectCandidate = useMutation(api.employerOps.rejectCandidate);
  const updateNotes = useMutation(api.employerOps.updateCandidateNotes);
  const [notes, setNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    if (candidate?.notes !== undefined) {
      setNotes(candidate.notes ?? '');
    }
  }, [candidate?.notes]);

  const handleSaveNotes = async () => {
    setNotesSaving(true);
    setNotesSaved(false);
    try {
      await updateNotes({
        email: userEmail,
        candidateId: candidateId as Id<'recruitmentCandidates'>,
        notes,
      });
      setNotesSaved(true);
    } finally {
      setNotesSaving(false);
    }
  };

  if (candidate === undefined) {
    return (
      <EcosystemPageLoader
        title={t('ecosystemPages.candidateDetail.title')}
        subtitle={t('ecosystemPages.candidateDetail.subtitle')}
      />
    );
  }

  if (!candidate) {
    return (
      <AppPageShell
        title={t('ecosystemPages.candidateDetail.notFound')}
        subtitle={t('ecosystemPages.candidateDetail.notFoundBody')}
      >
        <Button asChild variant="outline">
          <Link href="/business/recruitment">{t('ecosystemPages.candidateDetail.backToRecruitment')}</Link>
        </Button>
      </AppPageShell>
    );
  }

  const canAdvance = candidate.stage !== 'offer' && candidate.stage !== 'rejected';
  const canReject = candidate.stage !== 'rejected';

  return (
    <AppPageShell title={candidate.name} subtitle={candidate.jobTitle ?? candidate.position}>
      <div className="mb-6 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/business/recruitment">{t('ecosystemPages.candidateDetail.backToRecruitment')}</Link>
        </Button>
        {canAdvance ? (
          <Button
            size="sm"
            onClick={() =>
              void advanceCandidate({
                email: userEmail,
                candidateId: candidateId as Id<'recruitmentCandidates'>,
              })
            }
          >
            {t('employerOps.advanceStage')}
          </Button>
        ) : null}
        {canReject ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              void rejectCandidate({
                email: userEmail,
                candidateId: candidateId as Id<'recruitmentCandidates'>,
              })
            }
          >
            {t('employerOps.rejectCandidate')}
          </Button>
        ) : null}
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <div className="home-card-muted">
          <p className="text-xs text-muted-foreground">{t('ecosystemPages.shared.table.stage')}</p>
          <Badge className="mt-2 bg-primary/20 text-primary">
            {t(`ecosystemPages.shared.recruitmentStages.${candidate.stage}`)}
          </Badge>
        </div>
        <div className="home-card-muted">
          <p className="text-xs text-muted-foreground">{t('ecosystemPages.shared.table.score')}</p>
          <p className="mt-2 text-lg font-semibold text-primary">{candidate.score}/100</p>
        </div>
        <div className="home-card-muted">
          <p className="text-xs text-muted-foreground">{t('ecosystemPages.shared.table.position')}</p>
          <p className="mt-2 text-sm">{candidate.position}</p>
        </div>
        <div className="home-card-muted">
          <p className="text-xs text-muted-foreground">{t('ecosystemPages.shared.table.date')}</p>
          <p className="mt-2 text-sm">{new Date(candidate.appliedAt).toLocaleDateString()}</p>
        </div>
      </div>

      {candidate.applicantEmail ? (
        <p className="mb-6 text-sm text-muted-foreground">
          {t('ecosystemPages.shared.table.email')}: {candidate.applicantEmail}
        </p>
      ) : null}

      {candidate.careerProfile ? (
        <>
          <EcosystemSection title={t('ecosystemPages.candidateDetail.profileSnapshot')}>
            {candidate.careerProfile.location ? (
              <p className="mb-4 text-sm text-muted-foreground">
                {t('employerOps.location')}: {candidate.careerProfile.location}
              </p>
            ) : null}
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="home-card-muted">
                <h3 className="mb-2 text-sm font-semibold">{t('ecosystemPages.careerProfile.skillsSection')}</h3>
                {candidate.careerProfile.skills.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('ecosystemPages.careerProfile.emptySkills')}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {candidate.careerProfile.skills.map((skill) => (
                      <Badge key={skill.name} className="bg-white/10">
                        {skill.name} · {skill.level}/5
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="home-card-muted">
                <h3 className="mb-2 text-sm font-semibold">{t('ecosystemPages.careerProfile.languagesSection')}</h3>
                {candidate.careerProfile.languages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('ecosystemPages.careerProfile.emptyLanguages')}</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {candidate.careerProfile.languages.map((lang) => (
                      <li key={lang.name}>
                        {lang.name} — {lang.level}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </EcosystemSection>

          <EcosystemSection title={t('ecosystemPages.careerProfile.experienceSection')}>
            {candidate.careerProfile.experience.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('ecosystemPages.careerProfile.emptyExperience')}</p>
            ) : (
              <ul className="space-y-3">
                {candidate.careerProfile.experience.map((exp) => (
                  <li key={`${exp.company}-${exp.role}`} className="home-card-muted p-3 text-sm">
                    <p className="font-medium">{exp.role}</p>
                    <p className="text-muted-foreground">
                      {exp.company} · {exp.period}
                    </p>
                    {exp.description ? <p className="mt-1 text-muted-foreground">{exp.description}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </EcosystemSection>

          <EcosystemSection title={t('ecosystemPages.careerProfile.educationSection')}>
            {candidate.careerProfile.education.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('ecosystemPages.careerProfile.emptyEducation')}</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {candidate.careerProfile.education.map((edu) => (
                  <li key={`${edu.school}-${edu.year}`} className="home-card-muted p-3">
                    <p className="font-medium">{edu.school}</p>
                    <p className="text-muted-foreground">
                      {edu.degree} · {edu.year}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </EcosystemSection>
        </>
      ) : (
        <EcosystemSection title={t('ecosystemPages.candidateDetail.profileSnapshot')}>
          <p className="text-sm text-muted-foreground">{t('ecosystemPages.candidateDetail.noProfile')}</p>
        </EcosystemSection>
      )}

      <EcosystemSection title={t('ecosystemPages.careerApplicationDetail.stageHistory.title')}>
        <StageHistoryTimeline events={candidate.stageEvents} />
      </EcosystemSection>

      <EcosystemSection title={t('employerOps.candidateNotes')}>
        <div className="home-card-muted space-y-3 p-4">
          <Label htmlFor="candidate-notes">{t('ecosystemPages.shared.table.notes')}</Label>
          <Textarea
            id="candidate-notes"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setNotesSaved(false);
            }}
            rows={4}
            placeholder={t('employerOps.candidateNotesPlaceholder')}
          />
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={() => void handleSaveNotes()} disabled={notesSaving}>
              {notesSaving ? t('ecosystemPages.shared.saving') : t('employerOps.save')}
            </Button>
            {notesSaved ? (
              <span className="text-sm text-emerald-400">{t('employerOps.notesSaved')}</span>
            ) : null}
          </div>
        </div>
      </EcosystemSection>
    </AppPageShell>
  );
}
