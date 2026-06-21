import { internalAction, mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import {
  normalizeEmail,
  peerEmail,
  requireConversationParticipant,
} from './lib/helpers';

const messageItemValidator = v.object({
  id: v.string(),
  senderEmail: v.string(),
  body: v.string(),
  createdAt: v.number(),
  readAt: v.optional(v.number()),
  isOwn: v.boolean(),
});

export const listMessages = query({
  args: {
    email: v.string(),
    conversationId: v.id('conversations'),
    limit: v.optional(v.number()),
  },
  returns: v.array(messageItemValidator),
  handler: async (ctx, args) => {
    const { normalizedEmail } = await requireConversationParticipant(
      ctx,
      args.email,
      args.conversationId
    );
    const limit = args.limit ?? 100;

    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversation_createdAt', (q) => q.eq('conversationId', args.conversationId))
      .order('asc')
      .take(limit);

    return messages.map((m) => ({
      id: m._id.toString(),
      senderEmail: m.senderEmail,
      body: m.body,
      createdAt: m.createdAt,
      readAt: m.readAt,
      isOwn: m.senderEmail === normalizedEmail,
    }));
  },
});

export const sendMessage = mutation({
  args: {
    email: v.string(),
    conversationId: v.id('conversations'),
    body: v.string(),
    senderDisplayName: v.optional(v.string()),
  },
  returns: v.object({ messageId: v.string() }),
  handler: async (ctx, args) => {
    const trimmed = args.body.trim();
    if (!trimmed) throw new Error('Message cannot be empty.');
    if (trimmed.length > 4000) throw new Error('Message too long.');

    const { conversation, normalizedEmail } = await requireConversationParticipant(
      ctx,
      args.email,
      args.conversationId
    );

    const now = Date.now();
    const messageId = await ctx.db.insert('messages', {
      conversationId: args.conversationId,
      senderEmail: normalizedEmail,
      body: trimmed,
      createdAt: now,
    });

    const preview = trimmed.length > 120 ? `${trimmed.slice(0, 117)}...` : trimmed;
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: now,
      lastMessagePreview: preview,
    });

    const recipient = peerEmail(conversation, normalizedEmail);
    const senderProfile = await ctx.db
      .query('messageProfiles')
      .withIndex('by_email', (q) => q.eq('email', normalizedEmail))
      .first();

    const senderName =
      args.senderDisplayName?.trim() ||
      senderProfile?.displayName ||
      normalizedEmail.split('@')[0];

    await ctx.scheduler.runAfter(0, internal.notifyBridge.notifyRecipient, {
      recipientEmail: recipient,
      senderName,
      preview,
      conversationId: args.conversationId.toString(),
    });

    return { messageId: messageId.toString() };
  },
});

export const markConversationRead = mutation({
  args: {
    email: v.string(),
    conversationId: v.id('conversations'),
  },
  returns: v.object({ updated: v.number() }),
  handler: async (ctx, args) => {
    const { normalizedEmail } = await requireConversationParticipant(
      ctx,
      args.email,
      args.conversationId
    );

    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversation_createdAt', (q) => q.eq('conversationId', args.conversationId))
      .collect();

    const now = Date.now();
    let updated = 0;
    for (const message of messages) {
      if (message.senderEmail !== normalizedEmail && message.readAt === undefined) {
        await ctx.db.patch(message._id, { readAt: now });
        updated += 1;
      }
    }
    return { updated };
  },
});

export const getTotalUnreadCount = query({
  args: { email: v.string() },
  returns: v.number(),
  handler: async (ctx, args) => {
    const self = normalizeEmail(args.email);

    const asA = await ctx.db
      .query('conversations')
      .withIndex('by_participantA_lastMessageAt', (q) => q.eq('participantA', self))
      .collect();

    const asB = await ctx.db
      .query('conversations')
      .withIndex('by_participantB_lastMessageAt', (q) => q.eq('participantB', self))
      .collect();

    const conversationIds = new Set([...asA, ...asB].map((c) => c._id.toString()));
    let total = 0;

    for (const idStr of conversationIds) {
      const conversation = [...asA, ...asB].find((c) => c._id.toString() === idStr);
      if (!conversation) continue;

      const messages = await ctx.db
        .query('messages')
        .withIndex('by_conversation_createdAt', (q) => q.eq('conversationId', conversation._id))
        .collect();

      total += messages.filter((m) => m.senderEmail !== self && m.readAt === undefined).length;
    }

    return total;
  },
});

export const ping = query({
  args: {},
  returns: v.string(),
  handler: async () => 'ok',
});
