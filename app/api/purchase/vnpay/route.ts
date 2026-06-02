import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

function getConvexUrl() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error('NEXT_PUBLIC_CONVEX_URL is not configured');
  return url;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const purchaseId = String(body.purchaseId || '');

  if (!purchaseId) return NextResponse.json({ error: 'Missing purchaseId' }, { status: 400 });

  // In a real integration we'd call VNPay to build a signed payment url.
  // Here we either return a mock URL or construct a basic redirect when env variables are provided.
  const vnpayBase = process.env.VNPAY_BASE_URL;

  if (!vnpayBase) {
    // dev fallback — return a simple mock URL that the client can open
    return NextResponse.json({ payUrl: `/api/purchase/notify/vnpay?purchaseId=${encodeURIComponent(purchaseId)}&mock=1` });
  }

  // Minimal param set — implementers should replace with full VNPay signed flow
  const redirectUrl = `${vnpayBase}?purchaseId=${encodeURIComponent(purchaseId)}`;
  return NextResponse.json({ payUrl: redirectUrl });
}
