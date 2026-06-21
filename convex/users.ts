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

export const searchUsersForMessaging = query({
  args: {
    email: v.string(),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      email: v.string(),
      fullName: v.optional(v.string()),
      avatarUrl: v.optional(v.string()),
      hdpId: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const callerEmail = args.email.trim().toLowerCase();
    const caller = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', callerEmail))
      .first();
    if (!caller) throw new Error('User not found.');

    const needle = args.query.trim().toLowerCase();
    if (needle.length < 2) return [];

    const limit = Math.min(args.limit ?? 20, 20);
    const users = await ctx.db.query('users').collect();

    const matches = users
      .filter((user) => user.email !== callerEmail)
      .filter((user) => {
        const fullName = (user.fullName ?? user.name ?? '').toLowerCase();
        const email = user.email.toLowerCase();
        const username = (user.username ?? '').toLowerCase();
        const hdpId = (user.hdpId ?? '').toLowerCase();
        return (
          fullName.includes(needle) ||
          email.includes(needle) ||
          username.includes(needle) ||
          hdpId.includes(needle)
        );
      })
      .slice(0, limit)
      .map((user) => ({
        email: user.email,
        fullName: user.fullName ?? user.name,
        avatarUrl: user.avatarUrl,
        hdpId: user.hdpId,
      }));

    return matches;
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
