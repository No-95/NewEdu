import { redirect } from 'next/navigation';
import { getAuthenticatedSession } from '@/lib/auth';

const JOB_SEEKER_ROLES = new Set(['job_seeker']);

export async function requireJobSeekerRole() {
  const session = await getAuthenticatedSession();
  if (!session) {
    redirect('/auth?mode=signin');
  }

  const roles = session.onboarding.roles ?? [];
  const hasJobSeekerRole = roles.some((role) => JOB_SEEKER_ROLES.has(role));
  if (!hasJobSeekerRole) {
    redirect('/dashboard');
  }

  return session;
}
