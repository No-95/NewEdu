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
  '/expert-applicant',
  '/teacher-center',
  '/career',
  '/business',
  '/experts',
  '/tests',
];

async function getSession(email: string) {
  try {
    return await getConvexClient().query(api.auth.getSessionByEmail, {
      email: email.trim().toLowerCase(),
    });
  } catch {
    return null;
  }
}

function clearUserEmailCookie(response: NextResponse) {
  response.cookies.set({
    name: 'user_email',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

const AUTH_REQUIRED_PATHS = [
  '/business/internal-training',
  '/business/hr-management',
  '/business/recruitment',
  '/teacher-center/training-management',
  '/teacher-center/admission-crm',
  '/teacher-center/business-development',
  '/teacher-center/reporting',
  '/career/profile',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const email = request.cookies.get('user_email')?.value;

  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const requiresAuth = AUTH_REQUIRED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (requiresAuth && !email) {
    return NextResponse.redirect(new URL('/auth?mode=signin', request.url));
  }

  if (requiresAuth && email) {
    const session = await getSession(email);
    if (!session) {
      const response = NextResponse.redirect(new URL('/auth?mode=signin', request.url));
      clearUserEmailCookie(response);
      return response;
    }

    if (session.onboarding.required && !session.onboarding.completed) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    return NextResponse.next();
  }

  if (pathname.startsWith('/onboarding')) {
    if (!email) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    const session = await getSession(email);
    if (!session) {
      const response = NextResponse.redirect(new URL('/auth', request.url));
      clearUserEmailCookie(response);
      return response;
    }

    const { onboarding } = session;
    if (!onboarding.required || onboarding.completed) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  }

  if (pathname.startsWith('/auth')) {
    if (!email) {
      return NextResponse.next();
    }

    const session = await getSession(email);
    if (!session) {
      const response = NextResponse.next();
      clearUserEmailCookie(response);
      return response;
    }

    const { onboarding } = session;
    if (onboarding.required && !onboarding.completed) {
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

  const session = await getSession(email);
  if (!session) {
    const response = NextResponse.next();
    clearUserEmailCookie(response);
    return response;
  }

  if (session.onboarding.required && !session.onboarding.completed) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/courses/:path*',
    '/dashboard/:path*',
    '/community/:path*',
    '/events/:path*',
    '/jobs/:path*',
    '/books/:path*',
    '/contact-us/:path*',
    '/teacher-applicant/:path*',
    '/expert-applicant/:path*',
    '/teacher-center',
    '/teacher-center/:path*',
    '/career/:path*',
    '/business/:path*',
    '/experts/:path*',
    '/tests/:path*',
    '/auth',
    '/onboarding/:path*',
  ],
};
