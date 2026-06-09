import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/courses',
  '/dashboard',
  '/community',
  '/jobs',
  '/books',
  '/contact-us',
  '/teacher-applicant',
];

async function fetchOnboardingStatus(request: NextRequest) {
  const statusUrl = new URL('/api/onboarding/status', request.url);
  const statusResponse = await fetch(statusUrl, {
    headers: {
      cookie: request.headers.get('cookie') ?? '',
    },
  });

  if (!statusResponse.ok) {
    return null;
  }

  return (await statusResponse.json()) as { required?: boolean; completed?: boolean };
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

    const status = await fetchOnboardingStatus(request);
    if (status && (!status.required || status.completed)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  }

  if (pathname.startsWith('/auth') && email) {
    const status = await fetchOnboardingStatus(request);
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

  const status = await fetchOnboardingStatus(request);

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
