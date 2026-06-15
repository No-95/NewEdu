import { cookies } from 'next/headers';
import { CommunityForumClient } from '@/components/community/CommunityForumClient';

export default async function CommunityPage() {
  const cookieStore = await cookies();
  const userEmail = cookieStore.get('user_email')?.value ?? null;

  return <CommunityForumClient userEmail={userEmail} />;
}
