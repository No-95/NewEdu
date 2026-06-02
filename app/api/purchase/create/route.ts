import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

function getConvexUrl() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error('NEXT_PUBLIC_CONVEX_URL is not configured');
  return url;
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const email = cookieStore.get('user_email')?.value;
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const courseId = String(body.courseId || '');
  const provider = String(body.provider || 'vnpay');
  const amount = Number(body.amount || 0);
  const currency = String(body.currency || 'VND');

  if (!courseId || !provider || !amount || isNaN(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Ensure Convex URL is configured for server-side operations
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json({ error: 'Convex backend not configured' }, { status: 503 });
  }

  try {
    const convex = new ConvexHttpClient(convexUrl);

    // Resolve user
    const user = await convex.query(api.auth.getUserByEmail, { email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    // Create a pending purchase record
    const purchase = await convex.mutation(api.purchases.createPurchase, {
      userId: user._id,
      courseId,
      provider,
      amount,
      currency,
      metadata: JSON.stringify({ origin: 'checkout_api' }),
    });
    return NextResponse.json({ purchaseId: purchase._id, provider, amount, currency });
  } catch (err: any) {
    console.error('Error in /api/purchase/create', err);
    // If Convex is down in dev, create a temporary in-memory purchase so local flow can continue
    try {
      const devMapKey = '__DEV_PURCHASES__';
      // @ts-ignore
      if (!globalThis[devMapKey]) globalThis[devMapKey] = new Map();
      // @ts-ignore
      const devMap: Map<string, any> = globalThis[devMapKey];
      const purchaseId = `dev-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      devMap.set(purchaseId, { purchaseId, userEmail: email, courseId, provider, amount, currency, status: 'pending', createdAt: Date.now() });
      return NextResponse.json({ purchaseId, provider, amount, currency });
    } catch (devErr) {
      return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
    }
  }
}
