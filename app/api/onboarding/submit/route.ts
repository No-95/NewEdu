import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { onboardingSurveySchema } from '@/lib/onboarding/schema';

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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = onboardingSurveySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid survey data' },
      { status: 400 }
    );
  }

  const convex = new ConvexHttpClient(convexUrl);

  try {
    const status = await convex.query(api.onboarding.getOnboardingStatus, { email });

    if (status.completed) {
      return NextResponse.json(
        { error: 'Onboarding survey has already been completed.' },
        { status: 409 }
      );
    }

    if (!status.required) {
      return NextResponse.json(
        { error: 'Onboarding survey is not required for this account.' },
        { status: 403 }
      );
    }

    const result = await convex.mutation(api.onboarding.submitOnboardingSurvey, {
      email,
      ...parsed.data,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/onboarding/submit:', error);
    const message = error instanceof Error ? error.message : 'Failed to submit survey';
    const status = message.includes('already been completed') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
