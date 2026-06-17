import type { MutationCtx } from '../_generated/server';
import type { Id } from '../_generated/dataModel';
import { internal } from '../_generated/api';

export async function insertNotification(
  ctx: MutationCtx,
  args: {
    userId: Id<'users'>;
    type: string;
    title: string;
    body: string;
    href?: string;
    params?: Record<string, string>;
  }
) {
  await ctx.db.insert('notifications', {
    userId: args.userId,
    type: args.type,
    title: args.title,
    body: args.body,
    href: args.href,
    params: args.params,
    read: false,
    createdAt: Date.now(),
  });
}

export async function notifyUser(
  ctx: MutationCtx,
  args: {
    userId: Id<'users'>;
    type: string;
    title: string;
    body: string;
    href?: string;
    params?: Record<string, string>;
  }
) {
  await insertNotification(ctx, args);
  await ctx.scheduler.runAfter(0, internal.notifications.sendNotificationEmail, {
    userId: args.userId,
    type: args.type,
    params: args.params,
    href: args.href,
  });
}

export async function insertNotificationByEmail(
  ctx: MutationCtx,
  args: {
    email: string;
    type: string;
    title: string;
    body: string;
    href?: string;
    params?: Record<string, string>;
  }
) {
  const user = await ctx.db
    .query('users')
    .withIndex('by_email', (q) => q.eq('email', args.email.trim().toLowerCase()))
    .first();
  if (!user) return;
  await notifyUser(ctx, {
    userId: user._id,
    type: args.type,
    title: args.title,
    body: args.body,
    href: args.href,
    params: args.params,
  });
}
