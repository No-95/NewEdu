import { internalAction, internalQuery, mutation, query } from './_generated/server';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { sendEmail, wrapNotificationEmail } from './lib/email';
import { formatNotificationEmailCopy } from './lib/emailCopy';

async function requireUser(ctx: QueryCtx | MutationCtx, email: string) {
  const user = await ctx.db
    .query('users')
    .withIndex('by_email', (q) => q.eq('email', email.trim().toLowerCase()))
    .first();
  if (!user) throw new Error('User not found.');
  return user;
}

export const getUserEmailPrefs = internalQuery({
  args: { userId: v.id('users') },
  returns: v.union(
    v.null(),
    v.object({
      email: v.string(),
      emailNotificationsEnabled: v.boolean(),
      preferredLocale: v.optional(v.union(v.literal('en'), v.literal('vi'), v.literal('ko'))),
    })
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return {
      email: user.email,
      emailNotificationsEnabled: user.emailNotificationsEnabled !== false,
      preferredLocale: user.preferredLocale,
    };
  },
});

export const sendNotificationEmail = internalAction({
  args: {
    userId: v.id('users'),
    type: v.string(),
    params: v.optional(v.record(v.string(), v.string())),
    href: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const prefs = await ctx.runQuery(internal.notifications.getUserEmailPrefs, {
      userId: args.userId,
    });
    if (!prefs || !prefs.emailNotificationsEnabled) return null;

    const copy = formatNotificationEmailCopy(
      args.type,
      prefs.preferredLocale,
      args.params ?? undefined
    );
    if (!copy) return null;

    await sendEmail({
      to: prefs.email,
      subject: copy.title,
      html: wrapNotificationEmail({
        title: copy.title,
        body: copy.body,
        href: args.href,
        ctaLabel: copy.ctaLabel,
      }),
    });

    return null;
  },
});

export const listNotificationsForUser = query({
  args: { email: v.string(), limit: v.optional(v.number()) },
  returns: v.object({
    items: v.array(
      v.object({
        id: v.string(),
        type: v.string(),
        title: v.string(),
        body: v.string(),
        href: v.optional(v.string()),
        params: v.optional(v.record(v.string(), v.string())),
        read: v.boolean(),
        createdAt: v.number(),
      })
    ),
    unreadCount: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const limit = args.limit ?? 20;
    const items = await ctx.db
      .query('notifications')
      .withIndex('by_userId_createdAt', (q) => q.eq('userId', user._id))
      .order('desc')
      .take(limit);

    const unread = await ctx.db
      .query('notifications')
      .withIndex('by_userId_read', (q) => q.eq('userId', user._id).eq('read', false))
      .collect();

    return {
      items: items.map((n) => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        body: n.body,
        href: n.href,
        params: n.params,
        read: n.read,
        createdAt: n.createdAt,
      })),
      unreadCount: unread.length,
    };
  },
});

export const markNotificationRead = mutation({
  args: { email: v.string(), notificationId: v.id('notifications') },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== user._id) throw new Error('Not found.');
    await ctx.db.patch(args.notificationId, { read: true });
    return { success: true };
  },
});

export const markAllNotificationsRead = mutation({
  args: { email: v.string() },
  returns: v.object({ updated: v.number() }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const unread = await ctx.db
      .query('notifications')
      .withIndex('by_userId_read', (q) => q.eq('userId', user._id).eq('read', false))
      .collect();
    for (const n of unread) {
      await ctx.db.patch(n._id, { read: true });
    }
    return { updated: unread.length };
  },
});
