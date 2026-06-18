import { NextResponse } from 'next/server';
import { requireDevRoute } from '@/lib/api/require-dev-route';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

function getConvexUrl() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error('NEXT_PUBLIC_CONVEX_URL is not configured');
  return url;
}

export async function GET(request: Request) {
  const denied = requireDevRoute(request);
  if (denied) return denied;

  try {
    const convex = new ConvexHttpClient(getConvexUrl());
    const result = await convex.mutation(api.news.seedNewsArticles, {});
    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    console.error('Error seeding news articles', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
