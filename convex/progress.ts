import { mutation, query } from './_generated/server';
import type { MutationCtx } from './_generated/server';
import { v } from 'convex/values';

async function applyProgressSync(
  ctx: MutationCtx,
  args: {
    email: string;
    courseSlug: string;
    completedLectures: number;
    totalLectures: number;
    lastVideoId?: string;
  }
) {
  const user = await ctx.db
    .query('users')
    .withIndex('by_email', (q) => q.eq('email', args.email.trim().toLowerCase()))
    .first();
  if (!user) return false;

  const course = await ctx.db
    .query('courses')
    .withIndex('by_slug', (q) => q.eq('slug', args.courseSlug))
    .first();
  if (!course) return false;

  const now = Date.now();
  const existing = await ctx.db
    .query('userCourseProgress')
    .withIndex('by_user_course', (q) => q.eq('userId', user._id).eq('courseId', course._id))
    .first();

  const completedLectures = Math.max(args.completedLectures, existing?.completedLectures ?? 0);
  const totalLectures = Math.max(
    args.totalLectures,
    existing?.totalLectures ?? 0,
    course.totalVideos ?? 0
  );

  const patch = {
    completedLectures,
    totalLectures: totalLectures || args.totalLectures,
    lastVideoId: args.lastVideoId ?? existing?.lastVideoId,
    lastWatchedAt: args.lastVideoId ? now : existing?.lastWatchedAt,
    lastUpdated: now,
  };

  if (existing) {
    await ctx.db.patch(existing._id, patch);
  } else {
    await ctx.db.insert('userCourseProgress', {
      userId: user._id,
      courseId: course._id,
      ...patch,
    });
  }

  return true;
}

export const listProgressForUser = query({
  args: { userId: v.id('users') },
  returns: v.array(
    v.object({
      _id: v.string(),
      userId: v.string(),
      courseId: v.string(),
      courseSlug: v.optional(v.string()),
      completedLectures: v.number(),
      totalLectures: v.number(),
      lastVideoId: v.optional(v.string()),
      lastWatchedAt: v.optional(v.number()),
      lastUpdated: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query('userCourseProgress')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .collect();

    const results = [];
    for (const item of items) {
      const course = await ctx.db.get(item.courseId);
      results.push({
        _id: item._id.toString(),
        userId: item.userId.toString(),
        courseId: item.courseId.toString(),
        courseSlug: course?.slug,
        completedLectures: item.completedLectures,
        totalLectures: item.totalLectures,
        lastVideoId: item.lastVideoId,
        lastWatchedAt: item.lastWatchedAt,
        lastUpdated: item.lastUpdated,
      });
    }
    return results;
  },
});

export const listProgressByEmail = query({
  args: { email: v.string() },
  returns: v.array(
    v.object({
      courseSlug: v.string(),
      courseTitle: v.string(),
      completedLectures: v.number(),
      totalLectures: v.number(),
      progressPercent: v.number(),
      lastVideoId: v.optional(v.string()),
      lastWatchedAt: v.optional(v.number()),
    })
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email.trim().toLowerCase()))
      .first();
    if (!user) return [];

    const items = await ctx.db
      .query('userCourseProgress')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();

    const results = [];
    for (const item of items) {
      const course = await ctx.db.get(item.courseId);
      if (!course) continue;
      const progressPercent =
        item.totalLectures > 0
          ? Math.round((item.completedLectures / item.totalLectures) * 100)
          : 0;
      results.push({
        courseSlug: course.slug,
        courseTitle: course.title,
        completedLectures: item.completedLectures,
        totalLectures: item.totalLectures,
        progressPercent,
        lastVideoId: item.lastVideoId,
        lastWatchedAt: item.lastWatchedAt,
      });
    }
    return results;
  },
});

export const upsertProgress = mutation({
  args: {
    userId: v.id('users'),
    courseId: v.id('courses'),
    completedLectures: v.number(),
    totalLectures: v.number(),
    lastVideoId: v.optional(v.string()),
    lastWatchedAt: v.optional(v.number()),
  },
  returns: v.object({ _id: v.string() }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query('userCourseProgress')
      .withIndex('by_user_course', (q) => q.eq('userId', args.userId).eq('courseId', args.courseId))
      .first();

    const patch = {
      completedLectures: args.completedLectures,
      totalLectures: args.totalLectures,
      lastVideoId: args.lastVideoId,
      lastWatchedAt: args.lastWatchedAt,
      lastUpdated: now,
    };

    if (existing) {
      const completedLectures = Math.max(existing.completedLectures, args.completedLectures);
      await ctx.db.patch(existing._id, { ...patch, completedLectures });
      return { _id: existing._id.toString() };
    }

    const id = await ctx.db.insert('userCourseProgress', {
      userId: args.userId,
      courseId: args.courseId,
      ...patch,
    });
    return { _id: id.toString() };
  },
});

export const syncProgressByEmail = mutation({
  args: {
    email: v.string(),
    courseSlug: v.string(),
    completedLectures: v.number(),
    totalLectures: v.number(),
    lastVideoId: v.optional(v.string()),
  },
  returns: v.object({ synced: v.boolean() }),
  handler: async (ctx, args) => {
    const synced = await applyProgressSync(ctx, args);
    return { synced };
  },
});

export const migrateLocalProgressBatch = mutation({
  args: {
    email: v.string(),
    items: v.array(
      v.object({
        courseSlug: v.string(),
        completedLectures: v.number(),
        totalLectures: v.number(),
        lastVideoId: v.optional(v.string()),
      })
    ),
  },
  returns: v.object({ migrated: v.number() }),
  handler: async (ctx, args) => {
    let migrated = 0;
    for (const item of args.items) {
      const synced = await applyProgressSync(ctx, {
        email: args.email,
        ...item,
      });
      if (synced) migrated += 1;
    }
    return { migrated };
  },
});
