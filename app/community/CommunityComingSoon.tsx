'use client';

import { useLanguage } from '@/lib/context/LanguageContext';

export function CommunityComingSoon() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen items-center justify-center text-2xl">
      {t('community.comingSoon')}
    </div>
  );
}
