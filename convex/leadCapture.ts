import { mutation } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';

const SYSTEM_USER_EMAIL = 'system@hdp.edu';

async function getOrCreateSystemUser(ctx: any): Promise<Id<'users'>> {
  const existing = await ctx.db
    .query('users')
    .withIndex('by_email', (q) => q.eq('email', SYSTEM_USER_EMAIL))
    .first();

  if (existing) return existing._id;

  const now = Date.now();
  const id = await ctx.db.insert('users', {
    email: SYSTEM_USER_EMAIL,
    fullName: 'HDP EDU System',
    role: 'system',
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export const capturePublicLead = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    source: v.string(),
  },
  returns: v.object({ id: v.string() }),
  handler: async (ctx, args) => {
    const ownerId = await getOrCreateSystemUser(ctx);
    const now = Date.now();
    const id = await ctx.db.insert('crmLeads', {
      ownerId,
      name: args.name.trim(),
      phone: args.phone?.trim() || '',
      source: args.source.trim(),
      stage: 'new_lead',
      followUpDate: new Date().toISOString().slice(0, 10),
      email: args.email.trim().toLowerCase(),
      notes: `Lead from ${args.source}`,
      createdAt: now,
      updatedAt: now,
    });
    return { id: id.toString() };
  },
});
