import { NextResponse } from 'next/server';
import { requireDevRoute } from '@/lib/api/require-dev-route';
import { seedAllTests } from '@/lib/tests/seed-runner';

export async function GET(request: Request) {
  const denied = requireDevRoute(request);
  if (denied) return denied;

  try {
    const result = await seedAllTests();
    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    console.error('Error seeding tests', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
