import { ConvexHttpClient } from 'convex/browser';
import { NextResponse } from 'next/server';
import { api } from '@/convex/_generated/api';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_CONVEX_URL is missing.' }, { status: 500 });
    }

    const convex = new ConvexHttpClient(convexUrl);
    const user = await convex.query(api.auth.getUserByEmail, { email: normalizedEmail });
    if (!user) {
      return NextResponse.json({ error: 'No account found for this email.' }, { status: 404 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: 'user_email',
      value: normalizedEmail,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error('session route error', error);
    return NextResponse.json({ error: 'Failed to create session.' }, { status: 500 });
  }
}
