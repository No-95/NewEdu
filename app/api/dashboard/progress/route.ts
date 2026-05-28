import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

export async function GET() {
  const cookieStore = await cookies();
  const email = cookieStore.get('user_email')?.value;
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return NextResponse.json({ error: 'Convex URL not configured' }, { status: 500 });

  const convex = new ConvexHttpClient(convexUrl);
  try {
    const user = await convex.query(api.auth.getUserByEmail, { email });
    if (!user) return NextResponse.json({ progress: [] });

    const progress = await convex.query(api.progress.listProgressForUser, { userId: user._id as any });
    return NextResponse.json({ progress });
  } catch (err) {
    console.error('Error in /api/dashboard/progress:', err);
    return NextResponse.json({ error: 'Failed to load progress' }, { status: 500 });
  }
}
