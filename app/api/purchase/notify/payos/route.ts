import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';

import { api } from '@/convex/_generated/api';
import { getPayosClient, isPayosConfigured } from '@/lib/payos';

function getConvexUrl() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error('NEXT_PUBLIC_CONVEX_URL is not configured');
  return url;
}

async function activateByPurchaseId(purchaseId: string) {
  const convex = new ConvexHttpClient(getConvexUrl());
  try {
    await convex.mutation(api.purchases.activatePurchase, { purchaseId });
    return true;
  } catch (err) {
    console.error('convex.activatePurchase failed, falling back to dev map', err);
    try {
      // @ts-expect-error dev fallback map
      const devMap = globalThis.__DEV_PURCHASES__ as Map<string, { status: string }> | undefined;
      if (devMap?.has(purchaseId)) {
        const p = devMap.get(purchaseId)!;
        p.status = 'active';
        devMap.set(purchaseId, p);
        return true;
      }
    } catch (e) {
      console.error('dev fallback activate failed', e);
    }
    return false;
  }
}

export async function POST(req: Request) {
  const raw = await req.text();

  if (!isPayosConfigured()) {
    return NextResponse.json({ error: 'PayOS not configured' }, { status: 503 });
  }

  const payos = getPayosClient();
  if (!payos) {
    return NextResponse.json({ error: 'PayOS not configured' }, { status: 503 });
  }

  let webhookData: Awaited<ReturnType<typeof payos.webhooks.verify>>;
  try {
    webhookData = await payos.webhooks.verify(JSON.parse(raw || '{}'));
  } catch (error) {
    console.error('PayOS webhook verify failed:', error);
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 });
  }

  const orderCode = webhookData.orderCode;
  if (!orderCode) {
    return NextResponse.json({ error: 'Missing orderCode' }, { status: 400 });
  }

  const convex = new ConvexHttpClient(getConvexUrl());
  const purchase = await convex.query(api.purchases.getPurchaseByPayosOrderCode, {
    payosOrderCode: orderCode,
  });

  if (!purchase) {
    return NextResponse.json({ error: 'Purchase not found for order' }, { status: 404 });
  }

  if (purchase.status === 'active') {
    return NextResponse.json({ success: true });
  }

  const ok = await activateByPurchaseId(purchase._id);
  if (!ok) {
    return NextResponse.json({ error: 'Failed to activate purchase' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const purchaseId = url.searchParams.get('purchaseId') || '';
    const mock = url.searchParams.get('mock');

    if (!purchaseId) {
      return NextResponse.json({ error: 'Missing purchaseId' }, { status: 400 });
    }
    if (mock !== '1') {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
    }

    const ok = await activateByPurchaseId(purchaseId);
    if (!ok) {
      return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
