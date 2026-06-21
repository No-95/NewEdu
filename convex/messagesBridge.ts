import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { insertNotificationByEmail } from './lib/notificationsHelper';

export const notifyDirectMessage = mutation({
  args: {
    secret: v.string(),
    recipientEmail: v.string(),
    senderName: v.string(),
    preview: v.string(),
    conversationId: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const expected = process.env.MESSAGES_NOTIFY_SECRET;
    if (!expected || args.secret !== expected) {
      throw new Error('Unauthorized.');
    }

    const preview =
      args.preview.length > 120 ? `${args.preview.slice(0, 117)}...` : args.preview;

    await insertNotificationByEmail(ctx, {
      email: args.recipientEmail,
      type: 'direct_message',
      title: 'New message',
      body: `${args.senderName}: ${preview}`,
      href: '/?openMessenger=1',
      params: {
        senderName: args.senderName,
        preview,
        conversationId: args.conversationId ?? '',
      },
    });

    return { success: true };
  },
});
