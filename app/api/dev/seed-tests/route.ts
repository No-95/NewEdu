import { NextResponse } from 'next/server';
import { seedAllTests } from '@/lib/tests/seed-runner';

export async function GET() {
  try {
    const result = await seedAllTests();
    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    console.error('Error seeding tests', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
