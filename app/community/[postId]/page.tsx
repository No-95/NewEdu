import { CommunityPostClient } from '@/components/community/CommunityPostClient';

type PageProps = {
  params: Promise<{ postId: string }>;
};

export default async function CommunityPostPage({ params }: PageProps) {
  const { postId } = await params;
  return <CommunityPostClient postId={postId} />;
}
