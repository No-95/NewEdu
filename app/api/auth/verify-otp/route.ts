import { ConvexHttpClient } from 'convex/browser';
import { NextResponse } from 'next/server';
import { api } from '@/convex/_generated/api';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedOtp = String(otp).trim();

    if (!/^\d{6}$/.test(normalizedOtp)) {
      return NextResponse.json({ error: 'OTP must be 6 digits.' }, { status: 400 });
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_CONVEX_URL is missing.' }, { status: 500 });
    }

    const convex = new ConvexHttpClient(convexUrl);
    const result = await convex.mutation(api.auth.verifyOtp, { email: normalizedEmail, otp: normalizedOtp });

    return NextResponse.json({ message: 'OTP verified successfully.', ...result });
  } catch (error) {
    console.error('verify-otp error', error);
    return NextResponse.json({ error: 'Failed to verify OTP.' }, { status: 500 });
  }
}
