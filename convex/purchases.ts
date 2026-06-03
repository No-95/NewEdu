import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';

export const createPurchase = mutation({
  args: {
    userId: v.string(),
    courseId: v.string(),
    provider: v.string(),
    amount: v.number(),
    currency: v.string(),
    metadata: v.optional(v.string()),
  },
  returns: v.object({ _id: v.string(), userId: v.string(), courseId: v.string(), status: v.string(), createdAt: v.number() }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert('purchases', {
      userId: args.userId,
      courseId: args.courseId,
      provider: args.provider,
      amount: args.amount,
      currency: args.currency,
      status: 'pending',
      metadata: args.metadata,
      createdAt: now,
    });

    return { _id: id, userId: args.userId, courseId: args.courseId, status: 'pending', createdAt: now };
  },
});

export const getPurchase = query({
  args: { purchaseId: v.string() },
  returns: v.union(
    v.object({
      _id: v.string(),
      userId: v.string(),
      courseId: v.string(),
      provider: v.string(),
      amount: v.number(),
      currency: v.string(),
      status: v.string(),
      metadata: v.optional(v.string()),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const purchase = await ctx.db.get(args.purchaseId as Id<'purchases'>);
    if (!purchase) return null;
    return {
      _id: purchase._id,
      userId: purchase.userId,
      courseId: purchase.courseId,
      provider: purchase.provider,
      amount: purchase.amount,
      currency: purchase.currency,
      status: purchase.status,
      metadata: purchase.metadata,
      createdAt: purchase.createdAt,
    };
  },
});

export const setPurchaseMetadata = mutation({
  args: {
    purchaseId: v.string(),
    metadata: v.string(),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    try {
      await ctx.db.patch(args.purchaseId as Id<'purchases'>, { metadata: args.metadata });
      return { success: true };
    } catch {
      return { success: false };
    }
  },
});

export const getPurchaseByPayosOrderCode = query({
  args: { payosOrderCode: v.number() },
  returns: v.union(
    v.object({
      _id: v.string(),
      userId: v.string(),
      courseId: v.string(),
      status: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const purchases = await ctx.db.query('purchases').collect();
    for (const purchase of purchases) {
      if (!purchase.metadata) continue;
      try {
        const meta = JSON.parse(purchase.metadata) as { payosOrderCode?: number };
        if (meta.payosOrderCode === args.payosOrderCode) {
          return {
            _id: purchase._id,
            userId: purchase.userId,
            courseId: purchase.courseId,
            status: purchase.status,
          };
        }
      } catch {
        continue;
      }
    }
    return null;
  },
});

export const activatePurchase = mutation({
  args: { purchaseId: v.string() },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const purchase = await ctx.db.get(args.purchaseId as Id<'purchases'>);
    if (!purchase) {
      return { success: false };
    }

    if (purchase.status === 'active') {
      return { success: true };
    }

    await ctx.db.patch(purchase._id, { status: 'active' });

    const user = await ctx.db.get(purchase.userId as Id<'users'>);
    if (user) {
      await ctx.db.insert('transactions', {
        userId: user._id,
        type: 'purchase',
        amount: purchase.amount,
        description: `Purchase ${purchase.courseId}`,
        createdAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const hasAccess = query({
  args: { userId: v.string(), courseId: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const course = await ctx.db.query('courses').withIndex('by_slug', (q) => q.eq('slug', args.courseId)).first();
    if (!course) {
      const byId = await ctx.db.get(args.courseId as Id<'courses'>).catch(() => null);
      if (byId && byId.isFree) return true;
    } else {
      if (course.isFree) return true;
    }

    const purchases = await ctx.db
      .query('purchases')
      .withIndex('by_user_course', (q) => q.eq('userId', args.userId).eq('courseId', args.courseId))
      .collect();

    return purchases.some((p) => p.status === 'active');
  },
});
