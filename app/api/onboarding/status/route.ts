import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthenticatedSession } from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const email = cookieStore.get('user_email')?.value;
  if (!email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(session.onboarding, {
      headers: {
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error('Error in /api/onboarding/status:', error);
    return NextResponse.json({ error: 'Failed to load onboarding status' }, { status: 500 });
  }
}
