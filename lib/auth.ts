import { cookies } from 'next/headers';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';


export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const email = cookieStore.get('user_email')?.value;
  if (!email) return null;

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return null;

  const convex = new ConvexHttpClient(convexUrl);
  const user = await convex.query(api.auth.getUserByEmail, { email });
  return user;
}
