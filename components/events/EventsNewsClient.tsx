'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Calendar, Newspaper, Plus, Search, Tag } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const NEWS_CATEGORIES = ['news', 'events', 'announcements', 'partnerships'] as const;

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

export function EventsNewsClient({ userEmail }: { userEmail: string | null }) {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<string>('news');
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const articles = useQuery(api.news.listNewsArticles, {
    search: search.trim() || undefined,
    category: activeCategory ?? undefined,
    tag: activeTag ?? undefined,
  });
  const categories = useQuery(api.news.listNewsCategories, {});
  const createArticle = useMutation(api.news.createNewsArticle);

  const locale = language === 'vi' ? 'vi-VN' : language === 'ko' ? 'ko-KR' : 'en-US';

  const categoryOptions = useMemo(() => {
    const fromDb = (categories ?? []).map((item) => item.category);
    return [...new Set([...NEWS_CATEGORIES, ...fromDb])];
  }, [categories]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const article of articles ?? []) {
      for (const tag of article.tags) tags.add(tag);
    }
    return [...tags];
  }, [articles]);

  const handleSubmit = async () => {
    if (!userEmail) {
      setError(t('eventsPage.signInRequired'));
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      const result = await createArticle({
        email: userEmail,
        title,
        excerpt,
        body,
        category,
        tags,
      });

      setTitle('');
      setExcerpt('');
      setBody('');
      setTagsInput('');
      setDialogOpen(false);
      window.location.href = `/events/${result.slug}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : t('eventsPage.publishError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppPageShell
      title={t('eventsPage.title')}
      subtitle={t('eventsPage.subtitle')}
      actions={
        userEmail ? (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                {t('eventsPage.publishNews')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-border bg-card">
              <DialogHeader>
                <DialogTitle>{t('eventsPage.publishNews')}</DialogTitle>
                <DialogDescription>{t('eventsPage.publishHint')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('eventsPage.articleTitle')}</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('eventsPage.excerpt')}</label>
                  <Textarea rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('eventsPage.body')}</label>
                  <Textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('eventsPage.category')}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    {NEWS_CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {categoryLabel(t, item)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('eventsPage.tags')}</label>
                  <Input
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder={t('eventsPage.tagsPlaceholder')}
                  />
                </div>
                {error ? <p className="text-sm text-red-400">{error}</p> : null}
                <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                  {submitting ? t('eventsPage.publishing') : t('eventsPage.publish')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : null
      }
    >
      <div className="home-card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('eventsPage.searchPlaceholder')}
            className="border-border bg-background/60 pl-9"
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            activeCategory === null
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('eventsPage.allCategories')}
        </button>
        {categoryOptions.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setActiveCategory(item === activeCategory ? null : item)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              activeCategory === item
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
            }`}
          >
            {categoryLabel(t, item)}
          </button>
        ))}
      </div>

      {allTags.length > 0 ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                activeTag === tag
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Tag className="h-3 w-3" />#{tag}
            </button>
          ))}
        </div>
      ) : null}

      {articles === undefined ? (
        <div className="home-card-muted py-12 text-center text-sm text-muted-foreground">
          {t('eventsPage.loading')}
        </div>
      ) : articles.length === 0 ? (
        <div className="home-card py-14 text-center">
          <Newspaper className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
          <p className="text-muted-foreground">{t('eventsPage.empty')}</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/events/${article.slug}`}
              className="home-card group block transition-colors hover:border-primary/30"
            >
              <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {categoryLabel(t, article.category)}
                </Badge>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(article.publishedAt, locale)}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-foreground transition-colors group-hover:text-primary">
                {article.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span key={tag} className="text-xs text-muted-foreground">
                    #{tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppPageShell>
  );
}
