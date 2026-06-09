import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ConvexHttpClient } from 'convex/browser';

import { api } from '@/convex/_generated/api';

function getConvexUrl() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error('NEXT_PUBLIC_CONVEX_URL is not configured');
  return url;
}

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const email = cookieStore.get('user_email')?.value;
  if (!email) {
    return NextResponse.json({ claimed: false, hasAccess: false }, { status: 200 });
  }

  const url = new URL(req.url);
  const courseId = String(url.searchParams.get('courseId') || '').trim();
  if (!courseId) {
    return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
  }

  try {
    const convex = new ConvexHttpClient(getConvexUrl());
    const user = await convex.query(api.auth.getUserByEmail, { email });
    if (!user) {
      return NextResponse.json({ claimed: false, hasAccess: false });
    }

    const hasAccess = await convex.query(api.purchases.hasAccess, {
      userId: user._id,
      courseId,
    });
    if (!hasAccess) {
      return NextResponse.json({ claimed: false, hasAccess: false });
    }

    const claimed = await convex.query(api.bookOrders.hasCourseGiftClaim, {
      userId: user._id,
      courseId: courseId || undefined,
    });

    return NextResponse.json({ claimed, hasAccess: true });
  } catch (error) {
    console.error('GET /api/books/course-gift failed:', error);
    return NextResponse.json({ claimed: false, hasAccess: false }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const email = cookieStore.get('user_email')?.value;
  if (!email) {
    return NextResponse.json({ error: 'Vui lòng đăng nhập để nhận sách.' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const courseId = String(body.courseId || '').trim();
  const fullName = String(body.fullName || '').trim();
  const phone = String(body.phone || '').trim();
  const address = String(body.address || '').trim();
  const noteRaw = String(body.note || '').trim();
  const note = noteRaw || undefined;

  if (!courseId) {
    return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
  }

  try {
    const convex = new ConvexHttpClient(getConvexUrl());
    const user = await convex.query(api.auth.getUserByEmail, { email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const alreadyClaimed = await convex.query(api.bookOrders.hasCourseGiftClaim, {
      userId: user._id,
      courseId,
    });
    if (alreadyClaimed) {
      return NextResponse.json(
        { error: 'Mỗi tài khoản chỉ được đăng ký nhận sách một lần.' },
        { status: 409 },
      );
    }

    const result = await convex.action(api.bookOrders.submitCourseGiftBook, {
      userId: user._id,
      courseId,
      fullName,
      phone,
      address,
      note,
    });

    return NextResponse.json({ ok: true, orderId: result.orderId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gửi đơn thất bại.';
    console.error('POST /api/books/course-gift failed:', error);
    const status = message.includes('một lần') ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
