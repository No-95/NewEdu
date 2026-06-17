import { redirect } from 'next/navigation';
import { getAuthenticatedSession } from '@/lib/auth';

const EMPLOYER_ROLES = new Set(['employer']);

export async function requireEmployerRole() {
  const session = await getAuthenticatedSession();
  if (!session) {
    redirect('/auth?mode=signin');
  }

  const roles = session.onboarding.roles ?? [];
  const hasEmployerRole = roles.some((role) => EMPLOYER_ROLES.has(role));
  if (!hasEmployerRole) {
    redirect('/dashboard');
  }

  return session;
}
