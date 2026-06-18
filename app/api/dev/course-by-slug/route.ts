import { NextResponse } from 'next/server';
import { requireDevRoute } from '@/lib/api/require-dev-route';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

function getConvexUrl() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error('NEXT_PUBLIC_CONVEX_URL is not configured');
  return url;
}

export async function GET(req: Request) {
  const denied = requireDevRoute(req);
  if (denied) return denied;

  try {
    const url = new URL(req.url);
    const slug = String(url.searchParams.get('slug') || '');
    if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });

    const convex = new ConvexHttpClient(getConvexUrl());
    const course = await convex.query(api.courses.getCourseBySlug, { slug });
    return NextResponse.json({ course });
  } catch (err: any) {
    console.error('Error fetching course by slug', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
