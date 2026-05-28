import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json(null, { status: 401 });

    return NextResponse.json({
      id: user._id ?? null,
      fullName: user.fullName ?? null,
      email: user.email ?? null,
    });
  } catch (err) {
    return NextResponse.json(null, { status: 500 });
  }
}
