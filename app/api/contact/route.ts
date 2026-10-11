import { NextResponse } from 'next/server';
import { api } from '@/convex/_generated/api';
import { getConvexClient } from '@/lib/convex-server';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, email, message } = body as {
    name?: string;
    email?: string;
    message?: string;
  };

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: 'Thiếu thông tin bắt buộc' },
      { status: 400 }
    );
  }

  const convex = getConvexClient();

  try {
    await convex.mutation(api.contact.submitContactSubmission, {
      fullName: name,
      email,
      phone: '',
      feedback: message,
    });
  } catch (err) {
    console.error('Contact submission error:', err);
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}