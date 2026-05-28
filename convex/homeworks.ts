import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const listHomeworksForStudent = query({
  args: { userId: v.id('users') },
  returns: v.array(
    v.object({
      _id: v.string(),
      assignedTo: v.string(),
      assignedBy: v.optional(v.string()),
      courseId: v.optional(v.string()),
      title: v.string(),
      description: v.optional(v.string()),
      status: v.string(),
      dueDate: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.optional(v.number()),
    })
  ),
  handler: async (ctx, args) => {
    const items = await ctx.db.query('homeworks').withIndex('by_assignedTo', (q) => q.eq('assignedTo', args.userId)).order('asc').collect();
    return items.map((it) => ({ _id: it._id, assignedTo: it.assignedTo?.toString?.() ?? it.assignedTo, assignedBy: it.assignedBy?.toString?.() ?? it.assignedBy, courseId: it.courseId?.toString?.() ?? it.courseId, title: it.title, description: it.description, status: it.status, dueDate: it.dueDate, createdAt: it.createdAt, updatedAt: it.updatedAt }));
  },
});

export const addHomework = mutation({
  args: {
    homework: v.object({
      assignedTo: v.id('users'),
      assignedBy: v.optional(v.id('users')),
      courseId: v.optional(v.id('courses')),
      title: v.string(),
      description: v.optional(v.string()),
      status: v.union(v.literal('pending'), v.literal('in-progress'), v.literal('completed')),
      dueDate: v.optional(v.number()),
    }),
  },
  returns: v.object({ _id: v.string() }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const hw = { ...args.homework, createdAt: now, updatedAt: now };
    const id = await ctx.db.insert('homeworks', hw);
    return { _id: id };
  },
});
