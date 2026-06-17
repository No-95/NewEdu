import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { notifyUser } from './lib/notificationsHelper';

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
    const items = await ctx.db
      .query('homeworks')
      .withIndex('by_assignedTo', (q) => q.eq('assignedTo', args.userId))
      .order('asc')
      .collect();
    return items.map((it) => ({
      _id: it._id.toString(),
      assignedTo: it.assignedTo.toString(),
      assignedBy: it.assignedBy?.toString(),
      courseId: it.courseId?.toString(),
      title: it.title,
      description: it.description,
      status: it.status,
      dueDate: it.dueDate,
      createdAt: it.createdAt,
      updatedAt: it.updatedAt,
    }));
  },
});

export const listHomeworksByAssigner = query({
  args: {
    email: v.string(),
    status: v.optional(
      v.union(v.literal('pending'), v.literal('in-progress'), v.literal('completed'))
    ),
  },
  returns: v.array(
    v.object({
      id: v.string(),
      title: v.string(),
      status: v.string(),
      assigneeEmail: v.string(),
      assigneeName: v.string(),
      learnerNote: v.optional(v.string()),
      completedAt: v.optional(v.number()),
      dueDate: v.optional(v.number()),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const assigner = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email.trim().toLowerCase()))
      .first();
    if (!assigner) return [];

    let items = await ctx.db
      .query('homeworks')
      .withIndex('by_assignedBy', (q) => q.eq('assignedBy', assigner._id))
      .collect();

    if (args.status) {
      items = items.filter((item) => item.status === args.status);
    }

    const results = [];
    for (const item of items) {
      const assignee = await ctx.db.get(item.assignedTo);
      results.push({
        id: item._id.toString(),
        title: item.title,
        status: item.status,
        assigneeEmail: assignee?.email ?? '—',
        assigneeName: assignee?.fullName?.trim() || assignee?.email || '—',
        learnerNote: item.learnerNote,
        completedAt: item.completedAt ?? (item.status === 'completed' ? item.updatedAt : undefined),
        dueDate: item.dueDate,
        createdAt: item.createdAt,
      });
    }
    return results.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const assignHomeworkByEmail = mutation({
  args: {
    assignerEmail: v.string(),
    learnerEmail: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    courseId: v.optional(v.id('courses')),
  },
  returns: v.object({ id: v.string() }),
  handler: async (ctx, args) => {
    const assigner = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.assignerEmail.trim().toLowerCase()))
      .first();
    if (!assigner) throw new Error('Assigner not found.');

    const learner = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.learnerEmail.trim().toLowerCase()))
      .first();
    if (!learner) throw new Error('Learner not found.');

    const now = Date.now();
    const id = await ctx.db.insert('homeworks', {
      assignedTo: learner._id,
      assignedBy: assigner._id,
      courseId: args.courseId,
      title: args.title.trim(),
      description: args.description?.trim(),
      status: 'pending',
      dueDate: args.dueDate,
      createdAt: now,
      updatedAt: now,
    });

    await notifyUser(ctx, {
      userId: learner._id,
      type: 'homework_assigned',
      title: 'New homework assigned',
      body: args.title.trim(),
      href: '/dashboard',
      params: { title: args.title.trim() },
    });

    return { id: id.toString() };
  },
});

export const completeHomework = mutation({
  args: {
    learnerEmail: v.string(),
    homeworkId: v.id('homeworks'),
    note: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const learner = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.learnerEmail.trim().toLowerCase()))
      .first();
    if (!learner) throw new Error('Learner not found.');
    const homework = await ctx.db.get(args.homeworkId);
    if (!homework || homework.assignedTo !== learner._id) throw new Error('Homework not found.');
    const now = Date.now();
    await ctx.db.patch(args.homeworkId, {
      status: 'completed',
      learnerNote: args.note?.trim(),
      completedAt: now,
      updatedAt: now,
    });
    if (homework.assignedBy) {
      await notifyUser(ctx, {
        userId: homework.assignedBy,
        type: 'homework_completed',
        title: 'Homework completed',
        body: `${learner.fullName?.trim() || learner.email} completed "${homework.title}".`,
        href: '/teacher-center/training-management',
        params: {
          learnerName: learner.fullName?.trim() || learner.email,
          title: homework.title,
        },
      });
    }
    return { success: true };
  },
});
