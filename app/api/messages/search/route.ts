import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { api } from '@/convex/_generated/api';
import { getConvexClient } from '@/lib/convex-server';

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const email = cookieStore.get('user_email')?.value?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') ?? '';

  try {
    const results = await getConvexClient().query(api.users.searchUsersForMessaging, {
      email,
      query,
      limit: 20,
    });
    return NextResponse.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
