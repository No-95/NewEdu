import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

function getOtpHash(email: string, otp: string, secret: string) {
  return createHash('sha256').update(`${email}:${otp}:${secret}`).digest('hex');
}

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

    const cookieStore = await cookies();
    const storedHash = cookieStore.get('signup_otp_hash')?.value;
    const storedEmail = cookieStore.get('signup_otp_email')?.value;
    const expiresAt = Number(cookieStore.get('signup_otp_expires_at')?.value || '0');

    if (!storedHash || !storedEmail || !expiresAt) {
      return NextResponse.json({ error: 'No OTP session found.' }, { status: 400 });
    }

    if (Date.now() > expiresAt) {
      return NextResponse.json({ error: 'OTP has expired.' }, { status: 400 });
    }

    if (storedEmail !== normalizedEmail) {
      return NextResponse.json({ error: 'OTP email does not match.' }, { status: 400 });
    }

    const otpSecret = process.env.OTP_SIGNING_SECRET || process.env.RESEND_API_KEY;
    if (!otpSecret) {
      return NextResponse.json(
        { error: 'Server OTP secret is missing.' },
        { status: 500 }
      );
    }

    const computedHash = getOtpHash(normalizedEmail, normalizedOtp, otpSecret);
    if (computedHash !== storedHash) {
      return NextResponse.json({ error: 'Invalid OTP.' }, { status: 400 });
    }

    const response = NextResponse.json({ message: 'OTP verified successfully.' });
    response.cookies.delete('signup_otp_hash');
    response.cookies.delete('signup_otp_email');
    response.cookies.delete('signup_otp_expires_at');

    return response;
  } catch (error) {
    console.error('verify-otp error', error);
    return NextResponse.json({ error: 'Failed to verify OTP.' }, { status: 500 });
  }
}
