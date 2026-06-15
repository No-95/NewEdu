'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemActionBar } from '@/components/ecosystem/shared/EcosystemActionBar';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import {
  AI_MATCH_COURSES,
  AI_MATCH_JOBS,
  AI_MATCH_MENTORS,
} from '@/lib/ecosystem/mock-data';
import { useLanguage } from '@/lib/context/LanguageContext';
import { openFilePicker } from '@/lib/utils/client-actions';
import { Progress } from '@/components/ui/progress';
import { Upload, Sparkles } from 'lucide-react';

const UPLOAD_KEYS = ['uploadCv', 'uploadCertificates', 'uploadPortfolio'] as const;
const UPLOAD_ACCEPT: Record<(typeof UPLOAD_KEYS)[number], string> = {
  uploadCv: '.pdf,.doc,.docx',
  uploadCertificates: '.pdf,.jpg,.jpeg,.png',
  uploadPortfolio: '.pdf,.zip,.doc,.docx',
};

export function AiMatchingClient() {
  const { t } = useLanguage();
  const router = useRouter();
  const [uploads, setUploads] = useState<Partial<Record<(typeof UPLOAD_KEYS)[number], string>>>({});

  const pickUpload = (key: (typeof UPLOAD_KEYS)[number]) => {
    openFilePicker({
      accept: UPLOAD_ACCEPT[key],
      onSelect: (file) => {
        setUploads((prev) => ({ ...prev, [key]: file.name }));
      },
    });
  };

  return (
    <AppPageShell
      title={t('ecosystemPages.aiMatching.title')}
      subtitle={t('ecosystemPages.aiMatching.subtitle')}
      actions={
        <EcosystemActionBar
          actions={[
            { label: t('ecosystemPages.aiMatching.uploadCv'), variant: 'default', onClick: () => pickUpload('uploadCv') },
            { label: t('ecosystemPages.aiMatching.uploadCertificates'), variant: 'outline', onClick: () => pickUpload('uploadCertificates') },
            { label: t('ecosystemPages.aiMatching.uploadPortfolio'), variant: 'outline', onClick: () => pickUpload('uploadPortfolio') },
          ]}
        />
      }
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {UPLOAD_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => pickUpload(key)}
            className="home-card-muted flex flex-col items-center gap-3 border-dashed py-8 transition-colors hover:border-primary/40"
          >
            <Upload className="h-8 w-8 text-primary" />
            <span className="text-sm font-medium">{t(`ecosystemPages.aiMatching.${key}`)}</span>
            {uploads[key] ? (
              <span className="max-w-full truncate px-3 text-xs text-primary">{uploads[key]}</span>
            ) : null}
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
          {Object.keys(uploads).length > 0 ? (
            <button
              type="button"
              onClick={() => router.push('/career/profile')}
              className="mt-3 text-sm font-medium text-primary hover:underline"
            >
              {t('ecosystemPages.careerProfile.title')} →
            </button>
          ) : null}
        </div>
      </div>

      <EcosystemSection title={t('ecosystemPages.aiMatching.matchingJobs')}>
        <div className="grid gap-3">
          {AI_MATCH_JOBS.map((job) => (
            <Link key={job.jobTitle} href="/jobs" className="home-card-muted block transition-colors hover:border-primary/30">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{job.jobTitle}</p>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                </div>
                <span className="text-lg font-bold text-primary">{job.matchPercent}%</span>
              </div>
              <Progress value={job.matchPercent} className="mt-3 h-2" />
            </Link>
          ))}
        </div>
      </EcosystemSection>

      <div className="grid gap-8 lg:grid-cols-2">
        <EcosystemSection title={t('ecosystemPages.aiMatching.suggestedCourses')}>
          {AI_MATCH_COURSES.map((course) => (
            <Link key={course.title} href="/courses" className="home-card-muted mb-3 block transition-colors hover:border-primary/30">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{course.title}</p>
                  <p className="text-sm text-muted-foreground">{course.provider}</p>
                </div>
                <span className="font-bold text-primary">{course.matchPercent}%</span>
              </div>
            </Link>
          ))}
        </EcosystemSection>

        <EcosystemSection title={t('ecosystemPages.aiMatching.suggestedMentors')}>
          {AI_MATCH_MENTORS.map((mentor) => (
            <Link key={mentor.name} href="/experts/network" className="home-card-muted mb-3 block transition-colors hover:border-primary/30">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{mentor.name}</p>
                  <p className="text-sm text-muted-foreground">{mentor.specialty}</p>
                </div>
                <span className="font-bold text-primary">{mentor.matchPercent}%</span>
              </div>
            </Link>
          ))}
        </EcosystemSection>
      </div>
    </AppPageShell>
  );
}
