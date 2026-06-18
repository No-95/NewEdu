import { NextResponse } from 'next/server';

export function requireDevRoute(request: Request): NextResponse | null {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const secret = (process.env.DEV_SEED_SECRET || '').trim();
  if (!secret) {
    return NextResponse.json({ error: 'Dev routes are disabled in production.' }, { status: 403 });
  }

  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (token !== secret) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
  }

  return null;
}
