import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth';

export default async function CommunityPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect('/auth');
  }
  return <div className="min-h-screen flex items-center justify-center text-2xl">Community page coming soon.</div>;
}

