'use client';

import Link from 'next/link';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { useLanguage } from '@/lib/context/LanguageContext';

const TOOL_KEYS = ['training', 'crm', 'business', 'reports', 'library'] as const;
const TOOL_HREFS: Record<(typeof TOOL_KEYS)[number], string> = {
  training: '/teacher-center/training-management',
  crm: '/teacher-center/admission-crm',
  business: '/teacher-center/business-development',
  reports: '/teacher-center/reporting',
  library: '/teacher-center/resource-library',
};

const BENEFIT_KEYS = ['compensation', 'globalReach', 'flexibleSchedule', 'professionalGrowth', 'communitySupport', 'resources'] as const;
const BENEFIT_ICONS: Record<(typeof BENEFIT_KEYS)[number], string> = {
  compensation: '💰',
  globalReach: '🌍',
  flexibleSchedule: '⏰',
  professionalGrowth: '📈',
  communitySupport: '🤝',
  resources: '🎓',
};

export function TeacherCenterLandingClient() {
  const { t } = useLanguage();

  const whyJoinItems = t('teacherCenter.whyJoinItems', { returnObjects: true });
  const whyJoinList = Array.isArray(whyJoinItems) ? whyJoinItems : [];

  return (
    <AppPageShell
      title={t('teacherCenter.title')}
      subtitle={t('teacherCenter.subtitle')}
      actions={
        <>
          <Link
            href="/teacher-applicant"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
          >
            {t('teacherCenter.ctaApply')}
          </Link>
          <Link
            href="/auth?mode=signup"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-muted/50"
          >
            {t('teacherCenter.ctaSignUp')}
          </Link>
        </>
      }
    >
      <section className="mb-12 animate-slide-up">
        <h2 className="mb-6 text-2xl font-bold text-foreground">{t('teacherCenter.whyJoinTitle')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {whyJoinList.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/40 p-5 backdrop-blur-sm"
            >
              <span className="mt-0.5 shrink-0 text-primary">✓</span>
              <p className="text-sm leading-relaxed text-foreground/90 md:text-base">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12 animate-fade-in">
        <h2 className="mb-6 text-2xl font-bold text-foreground">{t('teacherCenter.benefitsTitle')}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {BENEFIT_KEYS.map((key) => (
            <div
              key={key}
              className="glass rounded-xl border border-border/50 p-6 transition-all duration-300 hover:shadow-glow-cyan"
            >
              <div className="mb-3 text-4xl">{BENEFIT_ICONS[key]}</div>
              <h3 className="mb-2 text-lg font-bold text-foreground">
                {t(`teacherApplicant.benefits.${key}`)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t(`teacherApplicant.benefits.${key}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="animate-slide-up">
        <h2 className="mb-6 text-2xl font-bold text-foreground">{t('teacherCenter.toolsTitle')}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TOOL_KEYS.map((key) => (
            <Link
              key={key}
              href={TOOL_HREFS[key]}
              className="group rounded-xl border border-border/50 bg-card/40 p-6 backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-primary/5"
            >
              <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary">
                {t(`teacherCenter.tools.${key}.title`)}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t(`teacherCenter.tools.${key}.description`)}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </AppPageShell>
  );
}
