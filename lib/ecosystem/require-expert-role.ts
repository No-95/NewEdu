import { redirect } from 'next/navigation';
import { getAuthenticatedSession } from '@/lib/auth';

const EXPERT_ROLES = new Set(['expert']);

export async function requireExpertRole() {
  const session = await getAuthenticatedSession();
  if (!session) {
    redirect('/auth?mode=signin');
  }

  const roles = session.onboarding.roles ?? [];
  const hasExpertRole = roles.some((role) => EXPERT_ROLES.has(role));
  if (!hasExpertRole) {
    redirect('/dashboard');
  }

  return session;
}
