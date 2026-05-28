import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

export async function GET() {
  const cookieStore = await cookies();
  const email = cookieStore.get('user_email')?.value;
  if (!email) return NextResponse.json(null, { status: 401 });

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return NextResponse.json(null, { status: 500 });

  const convex = new ConvexHttpClient(convexUrl);
  try {
    const user = await convex.query(api.auth.getUserByEmail, { email });
    return NextResponse.json(user || null);
  } catch (err) {
    console.error('Error in /api/profile/me:', err);
    return NextResponse.json(null, { status: 500 });
  }
}
