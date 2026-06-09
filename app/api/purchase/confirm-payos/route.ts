import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ConvexHttpClient } from 'convex/browser';

import { api } from '@/convex/_generated/api';
import { getPayosClient, isPayosConfigured } from '@/lib/payos';

function getConvexUrl() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error('NEXT_PUBLIC_CONVEX_URL is not configured');
  return url;
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const email = cookieStore.get('user_email')?.value;
  if (!email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const courseId = String(body.courseId || '');
  if (!courseId) {
    return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
  }

  const convex = new ConvexHttpClient(getConvexUrl());
  const user = await convex.query(api.auth.getUserByEmail, { email });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  const alreadyHasAccess = await convex.query(api.purchases.hasAccess, {
    userId: user._id,
    courseId,
  });
  if (alreadyHasAccess) {
    return NextResponse.json({ activated: true, hasAccess: true });
  }

  if (!isPayosConfigured()) {
    return NextResponse.json({ activated: false, hasAccess: false });
  }

  const payos = getPayosClient();
  if (!payos) {
    return NextResponse.json({ activated: false, hasAccess: false });
  }

  const pending = await convex.query(api.purchases.getLatestPendingPayosPurchase, {
    userId: user._id,
    courseId,
  });

  if (!pending?.metadata) {
    return NextResponse.json({ activated: false, hasAccess: false });
  }

  let payosOrderCode: number | null = null;
  try {
    const meta = JSON.parse(pending.metadata) as { payosOrderCode?: number };
    if (meta.payosOrderCode != null) {
      payosOrderCode = Number(meta.payosOrderCode);
    }
  } catch {
    return NextResponse.json({ activated: false, hasAccess: false });
  }

  if (!payosOrderCode || Number.isNaN(payosOrderCode)) {
    return NextResponse.json({ activated: false, hasAccess: false });
  }

  try {
    const payment = await payos.paymentRequests.get(payosOrderCode);
    if (payment.status !== 'PAID') {
      return NextResponse.json({
        activated: false,
        hasAccess: false,
        payosStatus: payment.status,
      });
    }
  } catch (error) {
    console.error('PayOS paymentRequests.get failed:', error);
    return NextResponse.json({ activated: false, hasAccess: false }, { status: 502 });
  }

  const result = await convex.mutation(api.purchases.activatePurchase, {
    purchaseId: pending._id,
  });

  if (!result.success) {
    return NextResponse.json({ activated: false, hasAccess: false }, { status: 500 });
  }

  return NextResponse.json({ activated: true, hasAccess: true });
}
