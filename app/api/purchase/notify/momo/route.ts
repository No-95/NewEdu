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
  const secret = process.env.MOMO_SECRET;
  if (!secret) return true; // allow in dev when secret missing
  if (!signatureHeader) return false;
  const computed = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return computed === signatureHeader;
}

export async function POST(req: Request) {
  const raw = await req.text();
  const ok = await verifySignature(raw, req.headers.get('x-momo-signature') || undefined);
  if (!ok) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });

  const payload = JSON.parse(raw || '{}');
  const purchaseId = String(payload.purchaseId || payload.orderId || '');
  if (!purchaseId) return NextResponse.json({ error: 'Missing purchaseId' }, { status: 400 });

  const convex = new ConvexHttpClient(getConvexUrl());
  await convex.mutation(api.purchases.activatePurchase, { purchaseId });

  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const purchaseId = url.searchParams.get('purchaseId') || '';
    const mock = url.searchParams.get('mock');
    if (!purchaseId) return NextResponse.json({ error: 'Missing purchaseId' }, { status: 400 });
    if (mock !== '1') return NextResponse.json({ error: 'Not allowed' }, { status: 403 });

    const convex = new ConvexHttpClient(getConvexUrl());
    await convex.mutation(api.purchases.activatePurchase, { purchaseId });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
