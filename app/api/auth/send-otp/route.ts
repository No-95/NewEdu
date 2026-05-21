import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

function getOtpHash(email: string, otp: string, secret: string) {
  return createHash('sha256').update(`${email}:${otp}:${secret}`).digest('hex');
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY is missing on server.' },
        { status: 500 }
      );
    }

    const otpSecret = process.env.OTP_SIGNING_SECRET || resendApiKey;
    const otp = generateOtp();
    const otpHash = getOtpHash(normalizedEmail, otp, otpSecret);

    const resend = new Resend(resendApiKey);
    const from = process.env.RESEND_FROM_EMAIL || 'HDP EDU <onboarding@resend.dev>';

    await resend.emails.send({
      from,
      to: normalizedEmail,
      subject: 'Your HDP EDU OTP Code',
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <h2>HDP EDU OTP Verification</h2>
          <p>Your OTP code is:</p>
          <p style="font-size:28px;font-weight:700;letter-spacing:4px">${otp}</p>
          <p>This code expires in 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    const response = NextResponse.json({ message: 'OTP sent successfully.' });
    const commonCookie = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 10 * 60,
      path: '/',
    };

    response.cookies.set('signup_otp_hash', otpHash, commonCookie);
    response.cookies.set('signup_otp_email', normalizedEmail, commonCookie);
    response.cookies.set(
      'signup_otp_expires_at',
      (Date.now() + 10 * 60 * 1000).toString(),
      commonCookie
    );

    return response;
  } catch (error) {
    console.error('send-otp error', error);
    return NextResponse.json({ error: 'Failed to send OTP.' }, { status: 500 });
  }
}
