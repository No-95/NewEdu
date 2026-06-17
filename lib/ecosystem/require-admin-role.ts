import { redirect } from 'next/navigation';
import { getAuthenticatedSession } from '@/lib/auth';

export async function requireAdminRole() {
  const session = await getAuthenticatedSession();
  if (!session) {
    redirect('/auth?mode=signin');
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  return session;
}
