'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { CvReviewDialog } from '@/components/ecosystem/career/CvReviewDialog';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Upload, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function AiMatchingClient({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const results = useQuery(api.career.getAiMatchingResults, { email: userEmail });
  const cvStatus = useQuery(api.career.getCvParseStatus, { email: userEmail });
  const generateUploadUrl = useMutation(api.career.generateCvUploadUrl);
  const saveCv = useMutation(api.career.saveCvStorageId);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewDraft, setReviewDraft] = useState<NonNullable<typeof cvStatus>['draft'] | null>(null);

  useEffect(() => {
    if (cvStatus?.status === 'ready' && cvStatus.draft && !reviewOpen) {
      setReviewDraft(cvStatus.draft);
      setReviewOpen(true);
    }
  }, [cvStatus?.status, cvStatus?.draft, reviewOpen]);

  const runParse = async () => {
    setParsing(true);
    setParseError('');
    try {
      const response = await fetch('/api/career/parse-cv', { method: 'POST' });
      const data = (await response.json()) as { error?: string; draft?: NonNullable<typeof cvStatus>['draft'] };
      if (!response.ok) {
        setParseError(data.error ?? 'Parse failed.');
        return;
      }
      if (data.draft) {
        setReviewDraft(data.draft);
        setReviewOpen(true);
      }
    } catch {
      setParseError('Parse failed.');
    } finally {
      setParsing(false);
    }
  };

  const handleCvUpload = async (file: File) => {
    setUploading(true);
    setParseError('');
    try {
      const uploadUrl = await generateUploadUrl({ email: userEmail });
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });
      const { storageId } = (await response.json()) as { storageId: Id<'_storage'> };
      await saveCv({ email: userEmail, storageId });
      await runParse();
    } finally {
      setUploading(false);
    }
  };

  const statusLabel =
    uploading || parsing || cvStatus?.status === 'parsing'
      ? t('ecosystemPages.aiMatching.parsingCv')
      : cvStatus?.status === 'failed'
        ? cvStatus.error ?? t('ecosystemPages.aiMatching.parseFailed')
        : cvStatus?.hasCvOnFile || results?.hasCvOnFile
          ? t('ecosystemPages.aiMatching.uploadSuccess')
          : null;

  return (
    <AppPageShell
      title={t('ecosystemPages.aiMatching.title')}
      subtitle={t('ecosystemPages.aiMatching.subtitle')}
    >
      <div className="mb-8">
        <label className="home-card-muted flex cursor-pointer flex-col items-center gap-3 border-dashed py-8 transition-colors hover:border-primary/40">
          <Upload className="h-8 w-8 text-primary" />
          <span className="text-sm font-medium">{t('ecosystemPages.aiMatching.uploadCv')}</span>
          <input
            type="file"
            accept=".pdf,.txt"
            className="hidden"
            disabled={uploading || parsing}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleCvUpload(file);
            }}
          />
          {statusLabel ? (
            <span
              className={`text-xs ${cvStatus?.status === 'failed' || parseError ? 'text-red-400' : 'text-muted-foreground'}`}
            >
              {parseError || statusLabel}
            </span>
          ) : null}
          {(cvStatus?.hasCvOnFile || results?.hasCvOnFile) && cvStatus?.status !== 'parsing' && !uploading && !parsing ? (
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={(e) => {
                e.preventDefault();
                void runParse();
              }}
            >
              {t('ecosystemPages.aiMatching.reparseCv')}
            </button>
          ) : null}
        </label>
        {results?.hasCvOnFile ? (
          <Badge className="mt-2 bg-primary/20 text-primary">{t('ecosystemPages.aiMatching.cvOnFile')}</Badge>
        ) : null}
      </div>

      <CvReviewDialog
        userEmail={userEmail}
        open={reviewOpen}
        draft={reviewDraft}
        onOpenChange={setReviewOpen}
      />

      <div className="home-card mb-8 flex items-start gap-4 border-primary/30 bg-primary/5">
        <Sparkles className="h-6 w-6 shrink-0 text-primary" />
        <div>
          <h3 className="font-semibold text-foreground">{t('ecosystemPages.aiMatching.aiAnalysis')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t('ecosystemPages.aiMatching.aiAnalysisBody')}</p>
          {!results?.hasProfile ? (
            <Link href="/career/profile" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
              {t('ecosystemPages.aiMatching.completeProfile')} →
            </Link>
          ) : null}
        </div>
      </div>

      {results?.skillGaps && results.skillGaps.length > 0 ? (
        <EcosystemSection title={t('ecosystemPages.aiMatching.skillGapsTitle')}>
          <div className="flex flex-wrap gap-2">
            {results.skillGaps.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm capitalize text-primary"
              >
                {skill}
              </span>
            ))}
          </div>
          <Link href="/career/profile" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
            {t('ecosystemPages.aiMatching.improveProfile')} →
          </Link>
        </EcosystemSection>
      ) : null}

      <EcosystemSection title={t('ecosystemPages.aiMatching.matchingJobs')}>
        {results?.jobs.length ? (
          <ul className="space-y-2">
            {results.jobs.map((job) => (
              <li key={job.id} className="home-card-muted flex items-center justify-between p-3">
                <div>
                  <Link href={`/jobs/${job.externalId}`} className="font-medium text-primary hover:underline">
                    {job.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {job.companyName} · {job.department}
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary">{job.matchScore}%</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t('ecosystemPages.aiMatching.emptyJobs')}</p>
        )}
      </EcosystemSection>

      <div className="grid gap-8 lg:grid-cols-2">
        <EcosystemSection title={t('ecosystemPages.aiMatching.suggestedCourses')}>
          {results?.courses.length ? (
            <ul className="space-y-2">
              {results.courses.map((course) => (
                <li key={course.id}>
                  <Link href={`/courses/${course.slug}`} className="text-sm text-primary hover:underline">
                    {course.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{t('ecosystemPages.aiMatching.emptyCourses')}</p>
          )}
        </EcosystemSection>

        <EcosystemSection title={t('ecosystemPages.aiMatching.suggestedMentors')}>
          {results?.experts.length ? (
            <ul className="space-y-2">
              {results.experts.map((expert) => (
                <li key={expert.id}>
                  <Link href={`/experts/${expert.id}`} className="text-sm text-primary hover:underline">
                    {expert.displayName} · {expert.headline}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{t('ecosystemPages.aiMatching.emptyMentors')}</p>
          )}
        </EcosystemSection>
      </div>
    </AppPageShell>
  );
}
