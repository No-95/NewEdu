import { NextResponse } from 'next/server';
import { api } from '@/convex/_generated/api';
import { getConvexClient } from '@/lib/convex-server';

type NotifyPayload = {
  recipientEmail?: string;
  senderName?: string;
  preview?: string;
  conversationId?: string;
};

export async function POST(req: Request) {
  const secret = req.headers.get('x-messages-notify-secret');
  const expected = process.env.MESSAGES_NOTIFY_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  let body: NotifyPayload;
  try {
    body = (await req.json()) as NotifyPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const recipientEmail = body.recipientEmail?.trim().toLowerCase();
  const senderName = body.senderName?.trim();
  const preview = body.preview?.trim();

  if (!recipientEmail || !senderName || !preview) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  try {
    const convex = getConvexClient();
    await convex.mutation(api.messagesBridge.notifyDirectMessage, {
      secret: expected,
      recipientEmail,
      senderName,
      preview,
      conversationId: body.conversationId,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Notification failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
