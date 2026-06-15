import { redirect } from 'next/navigation';
import { getAuthenticatedSession } from '@/lib/auth';

export async function requireEcosystemSession() {
  const session = await getAuthenticatedSession();
  if (!session) {
    redirect('/auth?mode=signin');
  }
  return session;
}
