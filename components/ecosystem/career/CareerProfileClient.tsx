'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemActionBar } from '@/components/ecosystem/shared/EcosystemActionBar';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { EcosystemPageLoader } from '@/components/ecosystem/shared/EcosystemPageLoader';
import { useLanguage } from '@/lib/context/LanguageContext';
import { buildContactHref, downloadTextFile, formatCareerProfileDocument } from '@/lib/utils/client-actions';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export function CareerProfileClient({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const profile = useQuery(api.ecosystem.getCareerProfile, { email: userEmail });

  if (profile === undefined) {
    return (
      <EcosystemPageLoader
        title={t('ecosystemPages.careerProfile.title')}
        subtitle={t('ecosystemPages.careerProfile.subtitle')}
      />
    );
  }

  const downloadCv = () => {
    const content = formatCareerProfileDocument(profile, 'cv');
    const filename = `${(profile.fullName || 'hdp-edu-profile').replace(/\s+/g, '-').toLowerCase()}-cv.txt`;
    downloadTextFile(filename, content);
  };

  const downloadPdf = () => {
    const content = formatCareerProfileDocument(profile, 'pdf-text');
    const filename = `${(profile.fullName || 'hdp-edu-profile').replace(/\s+/g, '-').toLowerCase()}-profile.txt`;
    downloadTextFile(filename, content);
  };

  return (
    <AppPageShell
      title={t('ecosystemPages.careerProfile.title')}
      subtitle={t('ecosystemPages.careerProfile.subtitle')}
      actions={
        <EcosystemActionBar
          actions={[
            {
              label: t('ecosystemPages.careerProfile.actions.edit'),
              variant: 'default',
              href: buildContactHref({
                topic: 'profile-update',
                role: 'job_seeker',
                message: 'I would like to update my career profile on HDP EDU.',
              }),
            },
            { label: t('ecosystemPages.careerProfile.actions.downloadCv'), variant: 'outline', onClick: downloadCv },
            { label: t('ecosystemPages.careerProfile.actions.downloadPdf'), variant: 'outline', onClick: downloadPdf },
          ]}
        />
      }
    >
      <div className="mb-8 grid gap-5 lg:grid-cols-3">
        <div className="home-card lg:col-span-2">
          <h2 className="text-xl font-bold text-foreground">{profile.fullName || t('ecosystemPages.careerProfile.noName')}</h2>
          <p className="mt-1 text-primary">{profile.headline || t('ecosystemPages.careerProfile.noHeadline')}</p>
          <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <p>{profile.email}</p>
            <p>{profile.phone || t('ecosystemPages.careerProfile.noPhone')}</p>
            <p>{profile.location || t('ecosystemPages.careerProfile.noLocation')}</p>
          </div>
        </div>
        <div className="home-card">
          <p className="text-sm text-muted-foreground">{t('ecosystemPages.careerProfile.completionTitle')}</p>
          <p className="mt-2 text-3xl font-bold text-primary">{profile.completionScore}%</p>
          <Progress value={profile.completionScore} className="mt-4 h-3" />
          <p className="mt-3 text-xs text-muted-foreground">{t('ecosystemPages.careerProfile.completionHint')}</p>
        </div>
      </div>

      <EcosystemSection title={t('ecosystemPages.careerProfile.skillsSection')}>
        {profile.skills.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-muted-foreground">
            {t('ecosystemPages.careerProfile.emptySkills')}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {profile.skills.map((skill) => (
              <div key={skill.name} className="home-card-muted">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-primary">{skill.level}%</span>
                </div>
                <Progress value={skill.level} className="h-2" />
              </div>
            ))}
          </div>
        )}
      </EcosystemSection>

      <div className="grid gap-8 lg:grid-cols-2">
        <EcosystemSection title={t('ecosystemPages.careerProfile.educationSection')}>
          {profile.education.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-muted-foreground">
              {t('ecosystemPages.careerProfile.emptyEducation')}
            </div>
          ) : (
            profile.education.map((edu) => (
              <div key={`${edu.school}-${edu.year}`} className="home-card-muted mb-3">
                <p className="font-semibold">{edu.school}</p>
                <p className="text-sm text-muted-foreground">
                  {edu.degree} · {edu.year}
                </p>
              </div>
            ))
          )}
        </EcosystemSection>

        <EcosystemSection title={t('ecosystemPages.careerProfile.certificatesSection')}>
          {profile.certificates.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-muted-foreground">
              {t('ecosystemPages.careerProfile.emptyCertificates')}
            </div>
          ) : (
            profile.certificates.map((cert) => (
              <div key={`${cert.name}-${cert.year}`} className="home-card-muted mb-3">
                <p className="font-semibold">{cert.name}</p>
                <p className="text-sm text-muted-foreground">
                  {cert.issuer} · {cert.year}
                </p>
              </div>
            ))
          )}
        </EcosystemSection>
      </div>

      <EcosystemSection title={t('ecosystemPages.careerProfile.experienceSection')}>
        {profile.experience.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-muted-foreground">
            {t('ecosystemPages.careerProfile.emptyExperience')}
          </div>
        ) : (
          profile.experience.map((exp) => (
            <div key={`${exp.company}-${exp.period}`} className="home-card-muted mb-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">{exp.role}</p>
                <Badge variant="secondary" className="bg-white/10">
                  {exp.period}
                </Badge>
              </div>
              <p className="text-sm text-primary">{exp.company}</p>
              <p className="mt-2 text-sm text-muted-foreground">{exp.description}</p>
            </div>
          ))
        )}
      </EcosystemSection>

      <EcosystemSection title={t('ecosystemPages.careerProfile.languagesSection')}>
        {profile.languages.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-muted-foreground">
            {t('ecosystemPages.careerProfile.emptyLanguages')}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.languages.map((lang) => (
              <Badge key={lang.name} className="bg-primary/20 text-primary">
                {lang.name}: {lang.level}
              </Badge>
            ))}
          </div>
        )}
      </EcosystemSection>
    </AppPageShell>
  );
}
