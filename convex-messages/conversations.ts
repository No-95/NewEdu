import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { normalizeEmail, peerEmail, sortParticipants } from './lib/helpers';

const conversationItemValidator = v.object({
  conversationId: v.string(),
  peerEmail: v.string(),
  peerDisplayName: v.optional(v.string()),
  peerAvatarUrl: v.optional(v.string()),
  lastMessageAt: v.number(),
  lastMessagePreview: v.string(),
  unreadCount: v.number(),
});

export const getOrCreateConversation = mutation({
  args: {
    email: v.string(),
    otherEmail: v.string(),
  },
  returns: v.object({ conversationId: v.string() }),
  handler: async (ctx, args) => {
    const self = normalizeEmail(args.email);
    const other = normalizeEmail(args.otherEmail);
    if (self === other) throw new Error('Cannot message yourself.');
    if (!other.includes('@')) throw new Error('Invalid recipient email.');

    const [participantA, participantB] = sortParticipants(self, other);
    const existing = await ctx.db
      .query('conversations')
      .withIndex('by_participants', (q) =>
        q.eq('participantA', participantA).eq('participantB', participantB)
      )
      .first();

    if (existing) {
      return { conversationId: existing._id.toString() };
    }

    const now = Date.now();
    const conversationId = await ctx.db.insert('conversations', {
      participantA,
      participantB,
      lastMessageAt: now,
      lastMessagePreview: '',
      createdAt: now,
    });
    return { conversationId: conversationId.toString() };
  },
});

export const listConversations = query({
  args: {
    email: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(conversationItemValidator),
  handler: async (ctx, args) => {
    const self = normalizeEmail(args.email);
    const limit = args.limit ?? 50;

    const asA = await ctx.db
      .query('conversations')
      .withIndex('by_participantA_lastMessageAt', (q) => q.eq('participantA', self))
      .order('desc')
      .take(limit);

    const asB = await ctx.db
      .query('conversations')
      .withIndex('by_participantB_lastMessageAt', (q) => q.eq('participantB', self))
      .order('desc')
      .take(limit);

    const merged = [...asA, ...asB]
      .sort((a, b) => b.lastMessageAt - a.lastMessageAt)
      .slice(0, limit);

    const results = [];
    for (const conversation of merged) {
      if (!conversation.lastMessagePreview && conversation.lastMessageAt === conversation.createdAt) {
        continue;
      }

      const other = peerEmail(conversation, self);
      const profile = await ctx.db
        .query('messageProfiles')
        .withIndex('by_email', (q) => q.eq('email', other))
        .first();

      const messages = await ctx.db
        .query('messages')
        .withIndex('by_conversation_createdAt', (q) => q.eq('conversationId', conversation._id))
        .collect();

      const unreadCount = messages.filter(
        (m) => m.senderEmail !== self && m.readAt === undefined
      ).length;

      results.push({
        conversationId: conversation._id.toString(),
        peerEmail: other,
        peerDisplayName: profile?.displayName,
        peerAvatarUrl: profile?.avatarUrl,
        lastMessageAt: conversation.lastMessageAt,
        lastMessagePreview: conversation.lastMessagePreview,
        unreadCount,
      });
    }

    return results;
  },
});
