import { cookies } from 'next/headers';
import { api } from '@/convex/_generated/api';
import { getConvexClient } from '@/lib/convex-server';

export async function getSessionForEmail(email: string) {
  return getConvexClient().query(api.auth.getSessionByEmail, {
    email: email.trim().toLowerCase(),
  });
}

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const email = cookieStore.get('user_email')?.value;
  if (!email) return null;

  try {
    const session = await getSessionForEmail(email);
    return session?.user ?? null;
  } catch {
    return null;
  }
}

export async function getAuthenticatedSession() {
  const cookieStore = await cookies();
  const email = cookieStore.get('user_email')?.value;
  if (!email) return null;

  try {
    return await getSessionForEmail(email);
  } catch {
    return null;
  }
}
