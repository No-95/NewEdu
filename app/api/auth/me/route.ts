import { NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json(null, { status: 401 });
    }

    return NextResponse.json(
      {
        id: session.user._id,
        fullName: session.user.fullName,
        email: session.user.email,
        activeRole: session.onboarding.activeRole,
        roles: session.onboarding.roles,
      },
      {
        headers: {
          'Cache-Control': 'private, no-store',
        },
      }
    );
  } catch {
    return NextResponse.json(null, { status: 500 });
  }
}
