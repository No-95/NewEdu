'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { MessageSquarePlus, Search, Tag } from 'lucide-react';
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

const SUGGESTED_TAGS = ['topik', 'manufacturing', 'careers', 'korean', 'study', 'general'] as const;

function formatDate(timestamp: number, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

export function CommunityForumClient({ userEmail }: { userEmail: string | null }) {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const posts = useQuery(api.community.listForumPosts, {
    tag: activeTag ?? undefined,
    search: search.trim() || undefined,
  });
  const tagStats = useQuery(api.community.listForumTags, {});
  const createPost = useMutation(api.community.createForumPost);

  const locale = language === 'vi' ? 'vi-VN' : language === 'ko' ? 'ko-KR' : 'en-US';

  const tagOptions = useMemo(() => {
    const fromPosts = (tagStats ?? []).map((item) => item.tag);
    return [...new Set([...SUGGESTED_TAGS, ...fromPosts])];
  }, [tagStats]);

  const handleSubmit = async () => {
    if (!userEmail) {
      setError(t('communityPage.signInRequired'));
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      await createPost({
        email: userEmail,
        title,
        body,
        tags: tags.length > 0 ? tags : ['general'],
      });

      setTitle('');
      setBody('');
      setTagsInput('');
      setDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('communityPage.postError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppPageShell
      title={t('communityPage.title')}
      subtitle={t('communityPage.subtitle')}
      actions={
        userEmail ? (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                {t('communityPage.newPost')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg border-border bg-card">
              <DialogHeader>
                <DialogTitle>{t('communityPage.newPost')}</DialogTitle>
                <DialogDescription>{t('communityPage.newPostHint')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('communityPage.postTitle')}</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('communityPage.postBody')}</label>
                  <Textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('communityPage.postTags')}</label>
                  <Input
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder={t('communityPage.postTagsPlaceholder')}
                  />
                </div>
                {error ? <p className="text-sm text-red-400">{error}</p> : null}
                <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                  {submitting ? t('communityPage.posting') : t('communityPage.publish')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Button asChild variant="outline" className="border-border">
            <Link href="/auth?mode=signin">{t('communityPage.signInToPost')}</Link>
          </Button>
        )
      }
    >
      <div className="home-card mb-6 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('communityPage.searchPlaceholder')}
            className="border-border bg-background/60 pl-9"
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTag(null)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            activeTag === null
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('communityPage.allTags')}
        </button>
        {tagOptions.map((tag) => (
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
            <Tag className="h-3 w-3" />
            #{tag}
          </button>
        ))}
      </div>

      {posts === undefined ? (
        <div className="home-card-muted py-12 text-center text-sm text-muted-foreground">
          {t('communityPage.loading')}
        </div>
      ) : posts.length === 0 ? (
        <div className="home-card py-14 text-center">
          <p className="text-muted-foreground">{t('communityPage.empty')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <article key={post.id} className="home-card transition-colors hover:border-primary/25">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-muted/50">
                    #{tag}
                  </Badge>
                ))}
              </div>
              <Link href={`/community/${post.id}`} className="group block">
                <h2 className="text-xl font-semibold text-foreground transition-colors group-hover:text-primary">
                  {post.title}
                </h2>
              </Link>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{post.body}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>{post.authorName}</span>
                <span>·</span>
                <span>{formatDate(post.createdAt, locale)}</span>
                <Link href={`/community/${post.id}`} className="ml-auto text-primary hover:underline">
                  {t('communityPage.readMore')}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </AppPageShell>
  );
}
