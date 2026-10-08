import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { cookies } from 'next/headers';
import { api } from '@/convex/_generated/api';
import { getConvexClient } from '@/lib/convex-server';

function fmtVnd(n: number) {
  return n.toLocaleString('vi-VN') + ' ₫';
}

export async function GET() {
  const cookieStore = await cookies();
  const email = cookieStore.get('user_email')?.value;
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return NextResponse.json({ error: 'Convex URL not configured' }, { status: 500 });

  const convex = new ConvexHttpClient(convexUrl);
  try {
    const user = await convex.query(api.auth.getUserByEmail, { email });
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const totalUsers = await convex.query(api.dashboard.getTotalUsers, {});
    const newUsers = await convex.query(api.dashboard.getNewUsers, { sinceDays: 30 });
    const activeLearners = await convex.query(api.dashboard.getActiveLearners, { sinceDays: 30 });
    const orders = await convex.query(api.dashboard.getOrderSummary, {});
    const revenue = await convex.query(api.dashboard.getRevenueSummary, {});

    return NextResponse.json({
      totalUsers: totalUsers ?? 0,
      newUsers30d: newUsers ?? 0,
      activeLearners30d: activeLearners ?? 0,
      totalOrders: orders.total ?? 0,
      totalRevenue: revenue.totalVnd ?? 0,
      revenueFormatted: fmtVnd(revenue.totalVnd ?? 0),
      generatedAt: Date.now(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
