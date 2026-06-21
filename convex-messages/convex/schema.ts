import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  messageProfiles: defineTable({
    email: v.string(),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    mainUserId: v.optional(v.string()),
    updatedAt: v.number(),
  }).index('by_email', ['email']),

  conversations: defineTable({
    participantA: v.string(),
    participantB: v.string(),
    lastMessageAt: v.number(),
    lastMessagePreview: v.string(),
    createdAt: v.number(),
  })
    .index('by_participants', ['participantA', 'participantB'])
    .index('by_participantA_lastMessageAt', ['participantA', 'lastMessageAt'])
    .index('by_participantB_lastMessageAt', ['participantB', 'lastMessageAt']),

  messages: defineTable({
    conversationId: v.id('conversations'),
    senderEmail: v.string(),
    body: v.string(),
    createdAt: v.number(),
    readAt: v.optional(v.number()),
  }).index('by_conversation_createdAt', ['conversationId', 'createdAt']),
});
