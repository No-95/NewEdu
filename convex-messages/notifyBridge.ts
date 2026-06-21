import { internalAction } from './_generated/server';
import { v } from 'convex/values';

export const notifyRecipient = internalAction({
  args: {
    recipientEmail: v.string(),
    senderName: v.string(),
    preview: v.string(),
    conversationId: v.string(),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    const siteUrl = (process.env.SITE_URL || 'https://hdpedu.com').replace(/\/+$/, '');
    const secret = process.env.MESSAGES_NOTIFY_SECRET;
    if (!secret) {
      console.warn('MESSAGES_NOTIFY_SECRET missing; skipping DM notification.');
      return null;
    }

    try {
      const response = await fetch(`${siteUrl}/api/messages/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-messages-notify-secret': secret,
        },
        body: JSON.stringify({
          recipientEmail: args.recipientEmail,
          senderName: args.senderName,
          preview: args.preview,
          conversationId: args.conversationId,
        }),
      });

      if (!response.ok) {
        console.warn('DM notify bridge failed:', response.status, await response.text());
      }
    } catch (error) {
      console.warn('DM notify bridge error:', error);
    }

    return null;
  },
});
