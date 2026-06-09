'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  EMPLOYER_STAGE_KEYS,
  GOAL_KEYS,
  INDUSTRY_KEYS,
  JOB_SEEKER_STAGE_KEYS,
  LEARNER_STAGE_KEYS,
  MARKETING_INTEREST_KEYS,
  ONBOARDING_LIMITS,
  ROLE_KEYS,
  type EmployerStageKey,
  type GoalKey,
  type IndustryKey,
  type JobSeekerStageKey,
  type LearnerStageKey,
  type MarketingInterestKey,
  type OnboardingSurveyInput,
  type RoleKey,
} from '@/lib/onboarding/schema';

const TOTAL_STEPS = 5;

type SurveyFormState = {
  roles: RoleKey[];
  goals: GoalKey[];
  goalOtherText: string;
  industries: IndustryKey[];
  industryOtherText: string;
  learnerStage?: LearnerStageKey;
  jobSeekerStage?: JobSeekerStageKey;
  employerStage?: EmployerStageKey;
  marketingInterests: MarketingInterestKey[];
};

const initialForm: SurveyFormState = {
  roles: [],
  goals: [],
  goalOtherText: '',
  industries: [],
  industryOtherText: '',
  marketingInterests: [],
};

function toggleItem<T extends string>(items: T[], value: T, max?: number): T[] {
  if (items.includes(value)) {
    return items.filter((item) => item !== value);
  }
  if (max !== undefined && items.length >= max) {
    return items;
  }
  return [...items, value];
}

export function OnboardingSurveyClient() {
  const { t } = useLanguage();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SurveyFormState>(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ hdpId: string } | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/onboarding/status', { cache: 'no-store' });
        if (response.status === 401) {
          router.replace('/auth');
          return;
        }
        if (response.ok) {
          const status = await response.json();
          if (status.completed || !status.required) {
            router.replace('/dashboard');
            return;
          }
        }
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [router]);

  const stepError = useMemo(() => {
    if (step === 1) {
      if (form.roles.length < ONBOARDING_LIMITS.minRoles) {
        return 'Select at least one role.';
      }
    }
    if (step === 2) {
      if (form.goals.length < ONBOARDING_LIMITS.minGoals) {
        return 'Select at least one goal.';
      }
      if (form.goals.includes('other') && !form.goalOtherText.trim()) {
        return 'Please describe your other goal.';
      }
    }
    if (step === 3) {
      if (form.industries.length < ONBOARDING_LIMITS.minIndustries) {
        return 'Select at least one industry.';
      }
      if (form.industries.includes('other') && !form.industryOtherText.trim()) {
        return 'Please describe your other industry.';
      }
    }
    if (step === 4) {
      if (form.roles.includes('learner') && !form.learnerStage) {
        return 'Select your learner stage.';
      }
      if (form.roles.includes('job_seeker') && !form.jobSeekerStage) {
        return 'Select your job seeker stage.';
      }
      if (form.roles.includes('employer') && !form.employerStage) {
        return 'Select your company size.';
      }
    }
    if (step === 5) {
      if (form.marketingInterests.length < ONBOARDING_LIMITS.minMarketingInterests) {
        return 'Select at least one marketing preference.';
      }
    }
    return '';
  }, [form, step]);

  const handleNext = () => {
    if (stepError) {
      setError(stepError);
      return;
    }
    setError('');
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setError('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (stepError) {
      setError(stepError);
      return;
    }

    setSubmitting(true);
    setError('');

    const payload: OnboardingSurveyInput = {
      roles: form.roles,
      goals: form.goals,
      goalOtherText: form.goalOtherText.trim() || undefined,
      industries: form.industries,
      industryOtherText: form.industryOtherText.trim() || undefined,
      learnerStage: form.learnerStage,
      jobSeekerStage: form.jobSeekerStage,
      employerStage: form.employerStage,
      marketingInterests: form.marketingInterests,
    };

    try {
      const response = await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const body = await response.json();
      if (!response.ok) {
        if (response.status === 409 || response.status === 403) {
          router.replace('/dashboard');
          return;
        }
        throw new Error(body.error ?? 'Failed to submit survey');
      }

      setResult({ hdpId: body.hdpId });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to submit survey');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-background">
        <ParticleBackground />
        <Header lockNavigation />
        <div className="relative z-10 flex min-h-screen items-center justify-center pt-20">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="relative min-h-screen bg-background">
        <ParticleBackground />
        <Header lockNavigation />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-6 pt-20 pb-12">
          <div className="home-card w-full max-w-lg text-center">
            <h1 className="text-2xl font-bold text-foreground">{t('onboarding.success.title')}</h1>
            <p className="mt-4 text-sm text-muted-foreground">{t('onboarding.success.hdpIdLabel')}</p>
            <p className="mt-2 text-3xl font-bold text-primary">{result.hdpId}</p>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="home-btn-primary mt-8 inline-flex px-8 py-3"
            >
              {t('onboarding.success.continue')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background">
      <ParticleBackground />
      <Header lockNavigation />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 pt-24 pb-12">
        <div className="mb-8 text-center">
          <p className="home-eyebrow mb-3 justify-center">HDP EDU</p>
          <h1 className="text-3xl font-bold text-foreground">{t('onboarding.welcome')}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {t('onboarding.stepLabel').replace('{{step}}', String(step)).replace('{{total}}', String(TOTAL_STEPS))}
          </p>
        </div>

        <div className="home-card flex-1">
          {step === 1 && (
            <StepPanel
              title={t('onboarding.step1.title')}
              subtitle={t('onboarding.step1.subtitle')}
              hint={t('onboarding.maxSelections').replace('{{max}}', String(ONBOARDING_LIMITS.maxRoles))}
            >
              <CheckboxGrid
                options={ROLE_KEYS}
                selected={form.roles}
                onToggle={(value) =>
                  setForm((prev) => ({ ...prev, roles: toggleItem(prev.roles, value, ONBOARDING_LIMITS.maxRoles) }))
                }
                labelFor={(key) => t(`onboarding.step1.options.${key}`)}
              />
            </StepPanel>
          )}

          {step === 2 && (
            <StepPanel
              title={t('onboarding.step2.title')}
              subtitle={t('onboarding.step2.subtitle')}
              hint={t('onboarding.maxSelections').replace('{{max}}', String(ONBOARDING_LIMITS.maxGoals))}
            >
              <CheckboxGrid
                options={GOAL_KEYS}
                selected={form.goals}
                onToggle={(value) =>
                  setForm((prev) => ({ ...prev, goals: toggleItem(prev.goals, value, ONBOARDING_LIMITS.maxGoals) }))
                }
                labelFor={(key) => t(`onboarding.step2.options.${key}`)}
              />
              {form.goals.includes('other') && (
                <OtherInput
                  value={form.goalOtherText}
                  onChange={(value) => setForm((prev) => ({ ...prev, goalOtherText: value }))}
                  placeholder={t('onboarding.otherPlaceholder')}
                />
              )}
            </StepPanel>
          )}

          {step === 3 && (
            <StepPanel
              title={t('onboarding.step3.title')}
              subtitle={t('onboarding.step3.subtitle')}
              hint={t('onboarding.maxSelections').replace('{{max}}', String(ONBOARDING_LIMITS.maxIndustries))}
            >
              <CheckboxGrid
                options={INDUSTRY_KEYS}
                selected={form.industries}
                onToggle={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    industries: toggleItem(prev.industries, value, ONBOARDING_LIMITS.maxIndustries),
                  }))
                }
                labelFor={(key) => t(`onboarding.step3.options.${key}`)}
              />
              {form.industries.includes('other') && (
                <OtherInput
                  value={form.industryOtherText}
                  onChange={(value) => setForm((prev) => ({ ...prev, industryOtherText: value }))}
                  placeholder={t('onboarding.otherPlaceholder')}
                />
              )}
            </StepPanel>
          )}

          {step === 4 && (
            <StepPanel title={t('onboarding.step4.title')} subtitle={t('onboarding.step4.subtitle')}>
              {form.roles.includes('learner') && (
                <RadioGroup
                  heading={t('onboarding.step4.learnerHeading')}
                  options={LEARNER_STAGE_KEYS}
                  value={form.learnerStage}
                  onChange={(value) => setForm((prev) => ({ ...prev, learnerStage: value }))}
                  labelFor={(key) => t(`onboarding.step4.learnerStages.${key}`)}
                />
              )}
              {form.roles.includes('job_seeker') && (
                <RadioGroup
                  heading={t('onboarding.step4.jobSeekerHeading')}
                  options={JOB_SEEKER_STAGE_KEYS}
                  value={form.jobSeekerStage}
                  onChange={(value) => setForm((prev) => ({ ...prev, jobSeekerStage: value }))}
                  labelFor={(key) => t(`onboarding.step4.jobSeekerStages.${key}`)}
                />
              )}
              {form.roles.includes('employer') && (
                <RadioGroup
                  heading={t('onboarding.step4.employerHeading')}
                  options={EMPLOYER_STAGE_KEYS}
                  value={form.employerStage}
                  onChange={(value) => setForm((prev) => ({ ...prev, employerStage: value }))}
                  labelFor={(key) => t(`onboarding.step4.employerStages.${key}`)}
                />
              )}
            </StepPanel>
          )}

          {step === 5 && (
            <StepPanel title={t('onboarding.step5.title')} subtitle={t('onboarding.step5.subtitle')}>
              <CheckboxGrid
                options={MARKETING_INTEREST_KEYS}
                selected={form.marketingInterests}
                onToggle={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    marketingInterests: toggleItem(prev.marketingInterests, value),
                  }))
                }
                labelFor={(key) => t(`onboarding.step5.options.${key}`)}
              />
            </StepPanel>
          )}

          {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1 || submitting}
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground disabled:opacity-40"
            >
              {t('onboarding.back')}
            </button>

            {step < TOTAL_STEPS ? (
              <button type="button" onClick={handleNext} className="home-btn-primary px-6 py-2.5 text-sm">
                {t('onboarding.next')}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="home-btn-primary px-6 py-2.5 text-sm disabled:opacity-60"
              >
                {submitting ? '...' : t('onboarding.submit')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepPanel({
  title,
  subtitle,
  hint,
  children,
}: {
  title: string;
  subtitle: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      {hint && <p className="mt-1 text-xs text-primary/80">{hint}</p>}
      <div className="mt-6 space-y-4">{children}</div>
    </div>
  );
}

function CheckboxGrid<T extends string>({
  options,
  selected,
  onToggle,
  labelFor,
}: {
  options: readonly T[];
  selected: T[];
  onToggle: (value: T) => void;
  labelFor: (key: T) => string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
              isSelected
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-white/10 bg-white/5 text-muted-foreground hover:border-primary/30'
            }`}
          >
            <span className="mr-2">{isSelected ? '☑' : '☐'}</span>
            {labelFor(option)}
          </button>
        );
      })}
    </div>
  );
}

function RadioGroup<T extends string>({
  heading,
  options,
  value,
  onChange,
  labelFor,
}: {
  heading: string;
  options: readonly T[];
  value?: T;
  onChange: (value: T) => void;
  labelFor: (key: T) => string;
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-foreground">{heading}</p>
      <div className="grid gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
              value === option
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-white/10 bg-white/5 text-muted-foreground hover:border-primary/30'
            }`}
          >
            <span className="mr-2">{value === option ? '●' : '○'}</span>
            {labelFor(option)}
          </button>
        ))}
      </div>
    </div>
  );
}

function OtherInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={ONBOARDING_LIMITS.otherTextMaxLength}
      className="w-full rounded-lg border border-white/10 bg-background/60 px-4 py-3 text-sm text-foreground outline-none focus:border-primary/40"
    />
  );
}
