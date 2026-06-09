import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { ROLE_KEYS } from '@/lib/onboarding/schema';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const email = cookieStore.get('user_email')?.value;
  if (!email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  let body: { roleKey?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const roleKey = body.roleKey?.trim();
  if (!roleKey || !ROLE_KEYS.includes(roleKey as (typeof ROLE_KEYS)[number])) {
    return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
  }

  const convex = new ConvexHttpClient(convexUrl);

  try {
    const result = await convex.mutation(api.onboarding.setActiveRole, { email, roleKey });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to switch role';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
