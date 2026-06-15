'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Badge } from '@/components/ui/badge';

function formatDate(timestamp: number, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

export function CommunityPostClient({ postId }: { postId: string }) {
  const { t, language } = useLanguage();
  const post = useQuery(api.community.getForumPost, { id: postId });
  const locale = language === 'vi' ? 'vi-VN' : language === 'ko' ? 'ko-KR' : 'en-US';

  if (post === undefined) {
    return (
      <AppPageShell title={t('communityPage.loading')} subtitle="">
        <div className="home-card-muted py-12 text-center text-sm text-muted-foreground">
          {t('communityPage.loading')}
        </div>
      </AppPageShell>
    );
  }

  if (!post) {
    return (
      <AppPageShell title={t('communityPage.notFound')} subtitle="">
        <div className="home-card py-12 text-center">
          <p className="mb-4 text-muted-foreground">{t('communityPage.notFound')}</p>
          <Link href="/community" className="text-primary hover:underline">
            {t('communityPage.backToForum')}
          </Link>
        </div>
      </AppPageShell>
    );
  }

  return (
    <AppPageShell title={post.title} subtitle={`${post.authorName} · ${formatDate(post.createdAt, locale)}`}>
      <Link href="/community" className="mb-6 inline-flex items-center gap-2 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        {t('communityPage.backToForum')}
      </Link>
      <article className="home-card">
        <div className="mb-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-muted/50">
              #{tag}
            </Badge>
          ))}
        </div>
        <div className="whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">{post.body}</div>
      </article>
    </AppPageShell>
  );
}
