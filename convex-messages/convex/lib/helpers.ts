import type { QueryCtx, MutationCtx } from '../_generated/server';
import type { Id } from '../_generated/dataModel';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function sortParticipants(emailA: string, emailB: string): [string, string] {
  const a = normalizeEmail(emailA);
  const b = normalizeEmail(emailB);
  return a < b ? [a, b] : [b, a];
}

export async function requireConversationParticipant(
  ctx: QueryCtx | MutationCtx,
  email: string,
  conversationId: Id<'conversations'>
) {
  const normalized = normalizeEmail(email);
  const conversation = await ctx.db.get(conversationId);
  if (!conversation) throw new Error('Conversation not found.');
  if (conversation.participantA !== normalized && conversation.participantB !== normalized) {
    throw new Error('Not a participant.');
  }
  return { conversation, normalizedEmail: normalized };
}

export function peerEmail(conversation: { participantA: string; participantB: string }, self: string) {
  return conversation.participantA === self ? conversation.participantB : conversation.participantA;
}
