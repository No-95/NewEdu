'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { ArrowLeft, Calendar } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Badge } from '@/components/ui/badge';

function formatDate(timestamp: number, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
  }).format(new Date(timestamp));
}

function categoryLabel(t: (key: string) => string, category: string) {
  const key = `eventsPage.categories.${category}`;
  const translated = t(key);
  return translated === key ? category : translated;
}

export function NewsArticleClient({ slug }: { slug: string }) {
  const { t, language } = useLanguage();
  const article = useQuery(api.news.getNewsBySlug, { slug });
  const locale = language === 'vi' ? 'vi-VN' : language === 'ko' ? 'ko-KR' : 'en-US';

  if (article === undefined) {
    return (
      <AppPageShell title={t('eventsPage.loading')} subtitle="">
        <div className="home-card-muted py-12 text-center text-sm text-muted-foreground">
          {t('eventsPage.loading')}
        </div>
      </AppPageShell>
    );
  }

  if (!article) {
    return (
      <AppPageShell title={t('eventsPage.notFound')} subtitle="">
        <div className="home-card py-12 text-center">
          <p className="mb-4 text-muted-foreground">{t('eventsPage.notFound')}</p>
          <Link href="/events" className="text-primary hover:underline">
            {t('eventsPage.backToNews')}
          </Link>
        </div>
      </AppPageShell>
    );
  }

  return (
    <AppPageShell
      title={article.title}
      subtitle={`${article.authorName} · ${formatDate(article.publishedAt, locale)}`}
    >
      <Link href="/events" className="mb-6 inline-flex items-center gap-2 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        {t('eventsPage.backToNews')}
      </Link>
      <article className="home-card max-w-4xl">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {categoryLabel(t, article.category)}
          </Badge>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(article.publishedAt, locale)}
          </span>
        </div>
        <p className="mb-6 text-lg leading-relaxed text-foreground/90">{article.excerpt}</p>
        <div className="mb-6 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-muted/50">
              #{tag}
            </Badge>
          ))}
        </div>
        <div className="whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">{article.body}</div>
      </article>
    </AppPageShell>
  );
}
