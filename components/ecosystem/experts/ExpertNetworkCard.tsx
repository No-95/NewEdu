'use client';

import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/context/LanguageContext';

export function ExpertNetworkCard({
  displayName,
  headline,
  bio,
  expertise,
  published,
}: {
  displayName: string;
  headline: string;
  bio?: string;
  expertise: string[];
  published?: boolean;
}) {
  const { t } = useLanguage();

  return (
    <article className="home-card space-y-3 p-6">
      <h2 className="text-xl font-bold">{displayName || t('ecosystemPages.expertProfile.displayName')}</h2>
      <p className="text-primary">{headline || t('ecosystemPages.expertProfile.headline')}</p>
      {bio ? <p className="text-sm text-muted-foreground">{bio}</p> : null}
      {published !== undefined ? (
        <Badge className={published ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10'}>
          {published ? t('dashboard.expert.published') : t('dashboard.expert.draft')}
        </Badge>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {expertise.length > 0 ? (
          expertise.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">{t('ecosystemPages.expertProfile.expertise')}</span>
        )}
      </div>
    </article>
  );
}
