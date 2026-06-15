import { NewsArticleClient } from '@/components/events/NewsArticleClient';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  return <NewsArticleClient slug={slug} />;
}
