import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const updateUserProfile = mutation({
  args: {
    email: v.string(),
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email.trim().toLowerCase()))
      .first();
    if (!user) throw new Error('User not found.');
    await ctx.db.patch(user._id, {
      fullName: args.fullName?.trim() || user.fullName,
      phone: args.phone?.trim() || user.phone,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const getUserSettings = query({
  args: { email: v.string() },
  returns: v.object({
    userId: v.string(),
    fullName: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
    hdpId: v.optional(v.string()),
    roles: v.array(v.string()),
    activeRole: v.optional(v.string()),
    emailNotificationsEnabled: v.boolean(),
    preferredLocale: v.optional(v.union(v.literal('en'), v.literal('vi'), v.literal('ko'))),
  }),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email.trim().toLowerCase()))
      .first();
    if (!user) throw new Error('User not found.');
    const onboarding = await ctx.db
      .query('userOnboarding')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();
    return {
      userId: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      hdpId: user.hdpId,
      roles: onboarding?.roles ?? [],
      activeRole: user.activeRole,
      emailNotificationsEnabled: user.emailNotificationsEnabled !== false,
      preferredLocale: user.preferredLocale,
    };
  },
});

export const updateNotificationPreferences = mutation({
  args: {
    email: v.string(),
    emailNotificationsEnabled: v.boolean(),
    preferredLocale: v.optional(v.union(v.literal('en'), v.literal('vi'), v.literal('ko'))),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email.trim().toLowerCase()))
      .first();
    if (!user) throw new Error('User not found.');
    await ctx.db.patch(user._id, {
      emailNotificationsEnabled: args.emailNotificationsEnabled,
      preferredLocale: args.preferredLocale,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});
