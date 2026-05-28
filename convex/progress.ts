import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const listProgressForUser = query({
  args: { userId: v.id('users') },
  returns: v.array(
    v.object({
      _id: v.string(),
      userId: v.string(),
      courseId: v.string(),
      completedLectures: v.number(),
      totalLectures: v.number(),
      lastUpdated: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query('userCourseProgress')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .collect();
    return items.map((it) => ({ _id: it._id, userId: it.userId?.toString?.() ?? it.userId, courseId: it.courseId?.toString?.() ?? it.courseId, completedLectures: it.completedLectures, totalLectures: it.totalLectures, lastUpdated: it.lastUpdated }));
  },
});

export const upsertProgress = mutation({
  args: {
    userId: v.id('users'),
    courseId: v.id('courses'),
    completedLectures: v.number(),
    totalLectures: v.number(),
  },
  returns: v.object({ _id: v.string() }),
  handler: async (ctx, args) => {
    const now = Date.now();
    // Try to find existing
    const existing = await ctx.db
      .query('userCourseProgress')
      .withIndex('by_user_course', (q) => q.eq('userId', args.userId).eq('courseId', args.courseId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { completedLectures: args.completedLectures, totalLectures: args.totalLectures, lastUpdated: now });
      return { _id: existing._id };
    }

    const id = await ctx.db.insert('userCourseProgress', {
      userId: args.userId,
      courseId: args.courseId,
      completedLectures: args.completedLectures,
      totalLectures: args.totalLectures,
      lastUpdated: now,
    });
    return { _id: id };
  },
});
