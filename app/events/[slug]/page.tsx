import type { Metadata } from 'next';

import { NewsArticleClient } from '@/components/events/NewsArticleClient';
import { api } from '@/convex/_generated/api';
import { buildMetadata, seoQuery } from '@/lib/seo';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await seoQuery((convex) => convex.query(api.news.getNewsBySlug, { slug }));

  if (!article) {
    return buildMetadata({
      title: 'Bài viết không tồn tại',
      description:
        'Bài viết bạn tìm không còn tồn tại hoặc đã được chuyển đi. Xem toàn bộ tin tức và sự kiện mới nhất tại HDP EDU.',
      path: `/events/${slug}`,
      index: false,
    });
  }

  return buildMetadata({
    title: article.title,
    description: article.excerpt || article.body,
    path: `/events/${slug}`,
  });
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  return <NewsArticleClient slug={slug} />;
}
