import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const listTransactionsForUser = query({
  args: { userId: v.id('users') },
  returns: v.array(
    v.object({
      _id: v.string(),
      userId: v.string(),
      type: v.union(v.literal('deposit'), v.literal('purchase')),
      amount: v.number(),
      description: v.string(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query('transactions')
      .withIndex('by_userId_createdAt', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect();
    return items.map((it) => ({ _id: it._id, userId: it.userId?.toString?.() ?? it.userId, type: it.type, amount: it.amount, description: it.description, createdAt: it.createdAt }));
  },
});

export const addTransaction = mutation({
  args: {
    userId: v.id('users'),
    type: v.union(v.literal('deposit'), v.literal('purchase')),
    amount: v.number(),
    description: v.string(),
  },
  returns: v.object({ _id: v.string(), userId: v.string(), type: v.union(v.literal('deposit'), v.literal('purchase')), amount: v.number(), description: v.string(), createdAt: v.number() }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert('transactions', { userId: args.userId, type: args.type, amount: args.amount, description: args.description, createdAt: now });
    return { _id: id, userId: args.userId, type: args.type, amount: args.amount, description: args.description, createdAt: now };
  },
});
