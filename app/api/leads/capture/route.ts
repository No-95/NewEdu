import { NextResponse } from 'next/server';
import { api } from '@/convex/_generated/api';
import { getConvexClient } from '@/lib/convex-server';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, email, phone, source } = body as {
    name?: string;
    email?: string;
    phone?: string;
    source?: string;
  };

  if (!name || !email) {
    return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
  }

  const convex = getConvexClient();

  try {
    await convex.mutation(api.leadCapture.capturePublicLead, {
      name,
      email,
      phone: phone || undefined,
      source: source || 'website',
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Lead capture error:', err);
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
  }
}
