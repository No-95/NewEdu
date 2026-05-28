import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const email = cookieStore.get('user_email')?.value;
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { username, fullName, avatarBase64 } = body;

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return NextResponse.json({ error: 'Convex URL not configured' }, { status: 500 });

  const convex = new ConvexHttpClient(convexUrl);

  const avatarUrl = avatarBase64 ?? undefined;

  // Server-side validation
  const MAX_BYTES = Number(process.env.PROFILE_AVATAR_MAX_BYTES ?? process.env.NEXT_PUBLIC_PROFILE_AVATAR_MAX_BYTES) || 200000;
  if (avatarUrl !== undefined) {
    if (typeof avatarUrl !== 'string' || !avatarUrl.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid avatar format' }, { status: 400 });
    }
    // estimate decoded bytes from base64 length
    const parts = avatarUrl.split(',');
    const b64 = parts[1] ?? '';
    const padding = (b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0);
    const decodedBytes = Math.floor((b64.length * 3) / 4) - padding;
    if (decodedBytes > MAX_BYTES) {
      return NextResponse.json({ error: 'Avatar too large' }, { status: 413 });
    }
  }

  try {
    console.log('/api/profile/update - incoming', { envNextConvex: !!process.env.NEXT_PUBLIC_CONVEX_URL, email })
    console.log('/api/profile/update - payload', { username, fullName, hasAvatar: !!avatarUrl })

    await convex.mutation(api.auth.updateUserProfile, {
      email,
      username: username ?? undefined,
      fullName: fullName ?? undefined,
      avatarUrl,
    });
    console.log('/api/profile/update - mutation complete')

    const user = await convex.query(api.auth.getUserByEmail, { email });
    console.log('/api/profile/update - fetched user after update', { user: !!user })
    return NextResponse.json(user || null);
  } catch (err) {
    console.error('Error in /api/profile/update:', err?.message ?? err, err?.stack ?? '')
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
