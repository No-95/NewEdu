import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { asConvexId } from '../../../../lib/convexHelpers';

export async function GET() {
  const cookieStore = await cookies();
  const email = cookieStore.get('user_email')?.value;
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return NextResponse.json({ error: 'Convex URL not configured' }, { status: 500 });

  const convex = new ConvexHttpClient(convexUrl);
  try {
    const user = await convex.query(api.auth.getUserByEmail, { email });
    if (!user) return NextResponse.json({ homeworks: [] });

    const homeworks = await convex.query(api.homeworks.listHomeworksForStudent, { userId: asConvexId(user._id) });
    return NextResponse.json({ homeworks });
  } catch (err) {
    console.error('Error in /api/dashboard/homeworks:', err);
    return NextResponse.json({ error: 'Failed to load homeworks' }, { status: 500 });
  }
}
