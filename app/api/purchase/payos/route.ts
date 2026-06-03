import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';

import { api } from '@/convex/_generated/api';
import {
  buildPayosOrderCode,
  getAppBaseUrl,
  getPayosClient,
  isPayosConfigured,
} from '@/lib/payos';

function getConvexUrl() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error('NEXT_PUBLIC_CONVEX_URL is not configured');
  return url;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const purchaseId = String(body.purchaseId || '');

  if (!purchaseId) {
    return NextResponse.json({ error: 'Missing purchaseId' }, { status: 400 });
  }

  if (!isPayosConfigured()) {
    return NextResponse.json({
      payUrl: `/api/purchase/notify/payos?purchaseId=${encodeURIComponent(purchaseId)}&mock=1`,
    });
  }

  const convex = new ConvexHttpClient(getConvexUrl());
  const purchase = await convex.query(api.purchases.getPurchase, { purchaseId });

  if (!purchase) {
    return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
  }

  if (purchase.status !== 'pending') {
    return NextResponse.json({ error: 'Purchase is not pending' }, { status: 400 });
  }

  const payos = getPayosClient();
  if (!payos) {
    return NextResponse.json({ error: 'PayOS not configured' }, { status: 500 });
  }

  const baseUrl = getAppBaseUrl(req);
  const orderCode = buildPayosOrderCode();
  const returnUrl = `${baseUrl}/courses/${encodeURIComponent(purchase.courseId)}?paid=1`;
  const cancelUrl = `${baseUrl}/courses/${encodeURIComponent(purchase.courseId)}?paid=0`;

  try {
    const payment = await payos.paymentRequests.create({
      orderCode,
      amount: purchase.amount,
      description: `Khoa hoc ${purchase.courseId}`.slice(0, 25),
      returnUrl,
      cancelUrl,
    });

    const metadata = JSON.stringify({
      payosOrderCode: orderCode,
      paymentLinkId: payment.paymentLinkId,
    });

    await convex.mutation(api.purchases.setPurchaseMetadata, {
      purchaseId,
      metadata,
    });

    const checkoutUrl = payment.checkoutUrl;
    if (!checkoutUrl) {
      return NextResponse.json({ error: 'PayOS did not return checkout URL' }, { status: 502 });
    }

    return NextResponse.json({ payUrl: checkoutUrl });
  } catch (error) {
    console.error('PayOS paymentRequests.create failed:', error);
    const message = error instanceof Error ? error.message : 'PayOS request failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
