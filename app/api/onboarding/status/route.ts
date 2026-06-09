import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

export async function GET() {
  const cookieStore = await cookies();
  const email = cookieStore.get('user_email')?.value;
  if (!email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const convex = new ConvexHttpClient(convexUrl);

  try {
    const status = await convex.query(api.onboarding.getOnboardingStatus, { email });
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error in /api/onboarding/status:', error);
    return NextResponse.json({ error: 'Failed to load onboarding status' }, { status: 500 });
  }
}
