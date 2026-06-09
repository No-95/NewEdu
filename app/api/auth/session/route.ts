import { NextResponse } from 'next/server';
import { api } from '@/convex/_generated/api';
import { getConvexClient } from '@/lib/convex-server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const session = await getConvexClient().query(api.auth.getSessionByEmail, {
      email: normalizedEmail,
    });
    if (!session) {
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
