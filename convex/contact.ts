import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const submitContactSubmission = mutation({
  args: {
    fullName: v.string(),
    email: v.string(),
    phone: v.string(),
    organization: v.optional(v.string()),
    role: v.optional(v.string()),
    feedback: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const now = Date.now();
    const submissionId = await ctx.db.insert('contactSubmissions', {
      fullName: args.fullName,
      email: args.email.trim().toLowerCase(),
      phone: args.phone,
      organization: args.organization,
      role: args.role,
      feedback: args.feedback,
      status: 'new',
      createdAt: now,
      updatedAt: now,
    });

    return submissionId.toString();
  },
});

export const listContactSubmissionsByEmail = query({
  args: {
    email: v.string(),
    roleFilter: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      id: v.string(),
      fullName: v.string(),
      feedback: v.string(),
      status: v.string(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const submissions = await ctx.db.query('contactSubmissions').order('desc').collect();
    return submissions
      .filter((entry) => {
        if (entry.email !== email) return false;
        if (args.roleFilter && !entry.role?.includes(args.roleFilter)) return false;
        return true;
      })
      .map((entry) => ({
        id: entry._id.toString(),
        fullName: entry.fullName,
        feedback: entry.feedback,
        status: entry.status,
        createdAt: entry.createdAt,
      }));
  },
});

export const listRecentContactSubmissions = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.string(),
      fullName: v.string(),
      email: v.string(),
      phone: v.string(),
      organization: v.optional(v.string()),
      role: v.optional(v.string()),
      feedback: v.string(),
      status: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 3;
    const submissions = await ctx.db.query('contactSubmissions').order('desc').take(limit);

    return submissions.map((submission) => ({
      _id: submission._id.toString(),
      fullName: submission.fullName,
      email: submission.email,
      phone: submission.phone,
      organization: submission.organization,
      role: submission.role,
      feedback: submission.feedback,
      status: submission.status,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
    }));
  },
});
