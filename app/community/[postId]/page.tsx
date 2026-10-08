import type { Metadata } from 'next';

import { CommunityPostClient } from '@/components/community/CommunityPostClient';
import { api } from '@/convex/_generated/api';
import { buildMetadata, seoQuery } from '@/lib/seo';

type PageProps = {
  params: Promise<{ postId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { postId } = await params;
  const post = await seoQuery((convex) => convex.query(api.community.getForumPost, { id: postId }));

  if (!post) {
    return buildMetadata({
      title: 'Bài thảo luận',
      description:
        'Thảo luận trong cộng đồng HDP EDU: kinh nghiệm học tiếng Hàn sản xuất và làm việc tại nhà máy, công xưởng Hàn Quốc.',
      path: `/community/${postId}`,
      index: false,
    });
  }

  return buildMetadata({
    title: post.title,
    description: post.body,
    path: `/community/${postId}`,
  });
}

export default async function CommunityPostPage({ params }: PageProps) {
  const { postId } = await params;
  return <CommunityPostClient postId={postId} />;
}
