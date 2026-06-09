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
  const fullName = String(body.fullName || '').trim();
  const phone = String(body.phone || '').trim();
  const address = String(body.address || '').trim();
  const noteRaw = String(body.note || '').trim();
  const note = noteRaw || undefined;

  if (!fullName || !phone || !address) {
    return NextResponse.json(
      { error: 'Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ giao hàng.' },
      { status: 400 }
    );
  }

  try {
    const convex = new ConvexHttpClient(getConvexUrl());
    const result = await convex.action(api.bookOrders.submitBookOrder, {
      fullName,
      phone,
      address,
      note,
    });

    return NextResponse.json({ ok: true, orderId: result.orderId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gửi đơn thất bại.';
    console.error('POST /api/books/order failed:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
