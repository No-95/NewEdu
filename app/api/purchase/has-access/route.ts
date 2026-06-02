import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

function getConvexUrl() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error('NEXT_PUBLIC_CONVEX_URL is not configured');
  return url;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const courseId = String(url.searchParams.get('courseId') || '');
    console.log('/api/purchase/has-access - courseId', { courseId });
    if (!courseId) return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });

    const cookieStore = await cookies();
    const email = cookieStore.get('user_email')?.value;
    console.log('/api/purchase/has-access - email', { email });
    if (!email) return NextResponse.json({ hasAccess: false });

    // Dev fallback: check in-memory purchases if Convex isn't available or to support local mocks
    try {
      // @ts-ignore
      const devMap = globalThis.__DEV_PURCHASES__ as Map<string, any> | undefined;
      if (devMap) {
        for (const [, p] of devMap) {
          if (p.userEmail === email && p.courseId === courseId && p.status === 'active') {
            return NextResponse.json({ hasAccess: true });
          }
        }
      }
    } catch (e) {
      // ignore
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || null;
    console.log('/api/purchase/has-access - convexUrl', { hasConvexUrl: !!convexUrl });
    if (!convexUrl) {
      console.warn('/api/purchase/has-access - NEXT_PUBLIC_CONVEX_URL is not set; returning hasAccess=false');
      return NextResponse.json({ hasAccess: false });
    }

    const convex = new ConvexHttpClient(convexUrl);
    let user
    try {
      user = await convex.query(api.auth.getUserByEmail, { email });
    } catch (innerErr) {
      console.error('convex.query(api.auth.getUserByEmail) failed', innerErr);
      // On Convex errors, treat as no access rather than returning 500
      return NextResponse.json({ hasAccess: false });
    }
    console.log('/api/purchase/has-access - user', { found: !!user, userId: user?._id })
    if (!user) return NextResponse.json({ hasAccess: false });

    try {
      const result = await convex.query(api.purchases.hasAccess, { userId: user._id, courseId });
      return NextResponse.json({ hasAccess: !!result });
    } catch (innerErr) {
      console.error('convex.query(api.purchases.hasAccess) failed', innerErr);
      return NextResponse.json({ hasAccess: false });
    }
  } catch (err: any) {
    console.error('Error in /api/purchase/has-access', err?.stack || err);
    return NextResponse.json({ hasAccess: false, error: String(err?.message || err) }, { status: 500 });
  }
}
