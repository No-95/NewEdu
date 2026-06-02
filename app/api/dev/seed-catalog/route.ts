import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

function getConvexUrl() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error('NEXT_PUBLIC_CONVEX_URL is not configured');
  return url;
}

export async function GET() {
  try {
    const convex = new ConvexHttpClient(getConvexUrl());
    await convex.mutation(api.courses.seedCourseCatalog, {});
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error seeding catalog', err);
    return NextResponse.json({ success: false, error: String(err?.message || err) }, { status: 500 });
  }
}
