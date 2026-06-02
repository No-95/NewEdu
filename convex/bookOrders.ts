import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const createBookOrder = mutation({
  args: {
    fullName: v.string(),
    phone: v.string(),
    address: v.string(),
    note: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert('bookOrders', {
      fullName: args.fullName,
      phone: args.phone,
      address: args.address,
      note: args.note,
      createdAt: Date.now(),
    });

    return null;
  },
});
