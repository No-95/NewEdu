import { redirect } from 'next/navigation';
import { getAuthenticatedSession } from '@/lib/auth';

const TEACHER_ROLES = new Set(['teacher', 'training_center']);

export async function requireTeacherRole() {
  const session = await getAuthenticatedSession();
  if (!session) {
    redirect('/auth?mode=signin');
  }

  const roles = session.onboarding.roles ?? [];
  const hasTeacherRole = roles.some((role) => TEACHER_ROLES.has(role));
  if (!hasTeacherRole) {
    redirect('/dashboard');
  }

  return session;
}
