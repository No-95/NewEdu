import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import crypto from 'crypto';

function getConvexUrl() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error('NEXT_PUBLIC_CONVEX_URL is not configured');
  return url;
}

async function verifySignature(body: string, signatureHeader?: string) {
  const secret = process.env.VNPAY_HASH_SECRET;
  if (!secret) return true; // allow in dev when secret missing
  if (!signatureHeader) return false;
  const computed = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return computed === signatureHeader;
}

export async function POST(req: Request) {
  const raw = await req.text();
  const ok = await verifySignature(raw, req.headers.get('x-vnpay-signature') || undefined);
  if (!ok) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });

  const payload = JSON.parse(raw || '{}');
  const purchaseId = String(payload.purchaseId || payload.orderId || '');
  if (!purchaseId) return NextResponse.json({ error: 'Missing purchaseId' }, { status: 400 });

  const convex = new ConvexHttpClient(getConvexUrl());
  try {
    await convex.mutation(api.purchases.activatePurchase, { purchaseId });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('convex.activatePurchase failed, falling back to dev map', err);
    // Dev fallback: mark in-memory purchase active
    try {
      // @ts-ignore
      const devMap = globalThis.__DEV_PURCHASES__ as Map<string, any> | undefined;
      if (devMap && devMap.has(purchaseId)) {
        // @ts-ignore
        const p = devMap.get(purchaseId);
        p.status = 'active';
        devMap.set(purchaseId, p);
        return NextResponse.json({ success: true });
      }
    } catch (e) {
      console.error('dev fallback activate failed', e);
    }
    return NextResponse.json({ error: 'Failed to activate purchase' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Dev helper: allow activation via query when `mock=1` used (local testing)
  try {
    const url = new URL(req.url);
    const purchaseId = url.searchParams.get('purchaseId') || '';
    const mock = url.searchParams.get('mock');
    if (!purchaseId) return NextResponse.json({ error: 'Missing purchaseId' }, { status: 400 });
    if (mock !== '1') return NextResponse.json({ error: 'Not allowed' }, { status: 403 });

    try {
      const convex = new ConvexHttpClient(getConvexUrl());
      await convex.mutation(api.purchases.activatePurchase, { purchaseId });
      return NextResponse.json({ success: true });
    } catch (err) {
      console.error('convex.activatePurchase failed in GET mock, falling back to dev map', err);
      try {
        // @ts-ignore
        const devMap = globalThis.__DEV_PURCHASES__ as Map<string, any> | undefined;
        if (devMap && devMap.has(purchaseId)) {
          // @ts-ignore
          const p = devMap.get(purchaseId);
          p.status = 'active';
          devMap.set(purchaseId, p);
          return NextResponse.json({ success: true });
        }
      } catch (e) {
        console.error('dev fallback activate failed', e);
      }
      return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
