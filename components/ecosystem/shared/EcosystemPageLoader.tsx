'use client';

import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { useLanguage } from '@/lib/context/LanguageContext';

export function EcosystemPageLoader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const { t } = useLanguage();

  return (
    <AppPageShell title={title} subtitle={subtitle}>
      <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-white/10 bg-white/5">
        <p className="text-sm text-muted-foreground">{t('ecosystemPages.shared.loading')}</p>
      </div>
    </AppPageShell>
  );
}
