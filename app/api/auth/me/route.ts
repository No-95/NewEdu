import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json(null, { status: 401 });

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    let activeRole: string | null = null;
    let roles: string[] = [];

    if (convexUrl && user.email) {
      const convex = new ConvexHttpClient(convexUrl);
      const status = await convex.query(api.onboarding.getOnboardingStatus, { email: user.email });
      activeRole = status.activeRole;
      roles = status.roles;
    }

    return NextResponse.json({
      id: user._id ?? null,
      fullName: user.fullName ?? null,
      email: user.email ?? null,
      activeRole,
      roles,
    });
  } catch {
    return NextResponse.json(null, { status: 500 });
  }
}
