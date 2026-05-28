import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

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

export const activatePurchase = mutation({
  args: { purchaseId: v.string() },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    // Attempt to patch the purchase to active in an idempotent way
    try {
      await ctx.db.patch(args.purchaseId, { status: 'active' });
    } catch (e) {
      // patch can fail if id not found; just return false
      return { success: false };
    }

    // Record a transaction for bookkeeping
    const purchase = await ctx.db.get(args.purchaseId);
    if (purchase) {
      await ctx.db.insert('transactions', {
        userId: purchase.userId,
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
    // If the course is free, everyone has access
    const course = await ctx.db.query('courses').withIndex('by_slug', (q) => q.eq('slug', args.courseId)).first();
    // Note: when callers pass a course _id string instead of slug, fallback to id lookup
    if (!course) {
      const byId = await ctx.db.get(args.courseId).catch(() => null);
      if (byId && (byId as any).isFree) return true;
    } else {
      if (course.isFree) return true;
    }

    // Check for an active purchase record
    const purchases = await ctx.db
      .query('purchases')
      .withIndex('by_user_course', (q) => q.eq('userId', args.userId).eq('courseId', args.courseId))
      .collect();

    return purchases.some((p) => p.status === 'active');
  },
});
