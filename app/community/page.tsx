import { redirect } from 'next/navigation';

import { CommunityComingSoon } from '@/app/community/CommunityComingSoon';
import { getAuthenticatedUser } from '@/lib/auth';

export default async function CommunityPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect('/auth');
  }
  return <CommunityComingSoon />;
}
