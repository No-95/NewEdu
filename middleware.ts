import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { api } from '@/convex/_generated/api';
import { getConvexClient } from '@/lib/convex-server';

const PROTECTED_PREFIXES = [
  '/courses',
  '/dashboard',
  '/community',
  '/jobs',
  '/books',
  '/contact-us',
  '/teacher-applicant',
];

async function getOnboardingGate(email: string) {
  try {
    return await getConvexClient().query(api.onboarding.getOnboardingStatus, {
      email: email.trim().toLowerCase(),
    });
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const email = request.cookies.get('user_email')?.value;

  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/onboarding')) {
    if (!email) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    const status = await getOnboardingGate(email);
    if (status && (!status.required || status.completed)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  }

  if (pathname.startsWith('/auth') && email) {
    const status = await getOnboardingGate(email);
    if (status?.required && !status.completed) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtected || !email) {
    return NextResponse.next();
  }

  const status = await getOnboardingGate(email);

  if (status?.required && !status.completed) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/courses/:path*',
    '/dashboard/:path*',
    '/community/:path*',
    '/jobs/:path*',
    '/books/:path*',
    '/contact-us/:path*',
    '/teacher-applicant/:path*',
    '/auth',
    '/onboarding/:path*',
  ],
};
