import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const consumeDailySupportRequest = mutation({
  args: {
    identifier: v.string(),
    dateKey: v.string(),
    limit: v.number(),
  },
  returns: v.object({
    allowed: v.boolean(),
    used: v.number(),
    remaining: v.number(),
    limit: v.number(),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const current = await ctx.db
      .query('supportDailyUsage')
      .withIndex('by_identifier_dateKey', (q) =>
        q.eq('identifier', args.identifier).eq('dateKey', args.dateKey)
      )
      .first();

    if (!current) {
      await ctx.db.insert('supportDailyUsage', {
        identifier: args.identifier,
        dateKey: args.dateKey,
        count: 1,
        updatedAt: now,
      });

      return {
        allowed: true,
        used: 1,
        remaining: Math.max(args.limit - 1, 0),
        limit: args.limit,
      };
    }

    if (current.count >= args.limit) {
      return {
        allowed: false,
        used: current.count,
        remaining: 0,
        limit: args.limit,
      };
    }

    const nextCount = current.count + 1;
    await ctx.db.patch(current._id, {
      count: nextCount,
      updatedAt: now,
    });

    return {
      allowed: true,
      used: nextCount,
      remaining: Math.max(args.limit - nextCount, 0),
      limit: args.limit,
    };
  },
});
