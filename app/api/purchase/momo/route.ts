import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const purchaseId = String(body.purchaseId || '');

  if (!purchaseId) return NextResponse.json({ error: 'Missing purchaseId' }, { status: 400 });

  const momoBase = process.env.MOMO_BASE_URL;
  if (!momoBase) {
    return NextResponse.json({ payUrl: `/api/purchase/notify/momo?purchaseId=${encodeURIComponent(purchaseId)}&mock=1` });
  }

  const redirectUrl = `${momoBase}?purchaseId=${encodeURIComponent(purchaseId)}`;
  return NextResponse.json({ payUrl: redirectUrl });
}
