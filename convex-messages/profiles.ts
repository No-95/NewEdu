import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { normalizeEmail } from './lib/helpers';

export const ensureProfile = mutation({
  args: {
    email: v.string(),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    mainUserId: v.optional(v.string()),
  },
  returns: v.object({ profileId: v.string() }),
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    const now = Date.now();
    const existing = await ctx.db
      .query('messageProfiles')
      .withIndex('by_email', (q) => q.eq('email', email))
      .first();

    const payload = {
      displayName: args.displayName?.trim() || existing?.displayName,
      avatarUrl: args.avatarUrl?.trim() || existing?.avatarUrl,
      mainUserId: args.mainUserId ?? existing?.mainUserId,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return { profileId: existing._id.toString() };
    }

    const profileId = await ctx.db.insert('messageProfiles', {
      email,
      ...payload,
      updatedAt: now,
    });
    return { profileId: profileId.toString() };
  },
});
