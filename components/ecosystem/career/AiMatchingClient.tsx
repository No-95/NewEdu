'use client';

import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemActionBar } from '@/components/ecosystem/shared/EcosystemActionBar';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import {
  AI_MATCH_COURSES,
  AI_MATCH_JOBS,
  AI_MATCH_MENTORS,
} from '@/lib/ecosystem/mock-data';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Progress } from '@/components/ui/progress';
import { Upload, Sparkles } from 'lucide-react';

const UPLOAD_KEYS = ['uploadCv', 'uploadCertificates', 'uploadPortfolio'] as const;

export function AiMatchingClient() {
  const { t } = useLanguage();

  return (
    <AppPageShell
      title={t('ecosystemPages.aiMatching.title')}
      subtitle={t('ecosystemPages.aiMatching.subtitle')}
      actions={
        <EcosystemActionBar
          actions={[
            { label: t('ecosystemPages.aiMatching.uploadCv'), variant: 'default' },
            { label: t('ecosystemPages.aiMatching.uploadCertificates'), variant: 'outline' },
            { label: t('ecosystemPages.aiMatching.uploadPortfolio'), variant: 'outline' },
          ]}
        />
      }
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {UPLOAD_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className="home-card-muted flex flex-col items-center gap-3 border-dashed py-8 transition-colors hover:border-primary/40"
          >
            <Upload className="h-8 w-8 text-primary" />
            <span className="text-sm font-medium">{t(`ecosystemPages.aiMatching.${key}`)}</span>
          </button>
        ))}
      </div>

      <div className="home-card mb-8 flex items-start gap-4 border-primary/30 bg-primary/5">
        <Sparkles className="h-6 w-6 shrink-0 text-primary" />
        <div>
          <h3 className="font-semibold text-foreground">{t('ecosystemPages.aiMatching.aiAnalysis')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('ecosystemPages.aiMatching.aiAnalysisBody')}
          </p>
        </div>
      </div>

      <EcosystemSection title={t('ecosystemPages.aiMatching.matchingJobs')}>
        <div className="grid gap-3">
          {AI_MATCH_JOBS.map((job) => (
            <div key={job.jobTitle} className="home-card-muted">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{job.jobTitle}</p>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                </div>
                <span className="text-lg font-bold text-primary">{job.matchPercent}%</span>
              </div>
              <Progress value={job.matchPercent} className="mt-3 h-2" />
            </div>
          ))}
        </div>
      </EcosystemSection>

      <div className="grid gap-8 lg:grid-cols-2">
        <EcosystemSection title={t('ecosystemPages.aiMatching.suggestedCourses')}>
          {AI_MATCH_COURSES.map((course) => (
            <div key={course.title} className="home-card-muted mb-3">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{course.title}</p>
                  <p className="text-sm text-muted-foreground">{course.provider}</p>
                </div>
                <span className="font-bold text-primary">{course.matchPercent}%</span>
              </div>
            </div>
          ))}
        </EcosystemSection>

        <EcosystemSection title={t('ecosystemPages.aiMatching.suggestedMentors')}>
          {AI_MATCH_MENTORS.map((mentor) => (
            <div key={mentor.name} className="home-card-muted mb-3">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{mentor.name}</p>
                  <p className="text-sm text-muted-foreground">{mentor.specialty}</p>
                </div>
                <span className="font-bold text-primary">{mentor.matchPercent}%</span>
              </div>
            </div>
          ))}
        </EcosystemSection>
      </div>
    </AppPageShell>
  );
}
