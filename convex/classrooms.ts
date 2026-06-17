import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

const LIVE_TIMEOUT_MS = 60 * 1000;

export const upsertClassroom = mutation({
  args: {
    roomID: v.string(),
    title: v.string(),
    hostName: v.string(),
    hostUserId: v.optional(v.id('users')),
    roomPassword: v.optional(v.string()),
    status: v.union(v.literal('live'), v.literal('ended')),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query('liveClassrooms')
      .withIndex('by_roomID', (q) => q.eq('roomID', args.roomID))
      .first();

    if (existing) {
      const patchData: {
        title: string;
        hostName: string;
        status: 'live' | 'ended';
        lastActiveAt: number;
        roomPassword?: string;
        hostUserId?: typeof args.hostUserId;
      } = {
        title: args.title,
        hostName: args.hostName,
        status: args.status,
        lastActiveAt: now,
      };

      if (args.roomPassword !== undefined) {
        patchData.roomPassword = args.roomPassword;
      }
      if (args.hostUserId !== undefined) {
        patchData.hostUserId = args.hostUserId;
      }

      await ctx.db.patch(existing._id, {
        ...patchData,
      });
      return null;
    }

    await ctx.db.insert('liveClassrooms', {
      roomID: args.roomID,
      title: args.title,
      hostName: args.hostName,
      hostUserId: args.hostUserId,
      roomPassword: args.roomPassword,
      status: args.status,
      startedAt: now,
      lastActiveAt: now,
    });

    return null;
  },
});

export const touchClassroom = mutation({
  args: {
    roomID: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('liveClassrooms')
      .withIndex('by_roomID', (q) => q.eq('roomID', args.roomID))
      .first();

    if (!existing) {
      return null;
    }

    await ctx.db.patch(existing._id, {
      status: 'live',
      lastActiveAt: Date.now(),
    });

    return null;
  },
});

export const endClassroom = mutation({
  args: {
    roomID: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('liveClassrooms')
      .withIndex('by_roomID', (q) => q.eq('roomID', args.roomID))
      .first();

    if (!existing) {
      return null;
    }

    await ctx.db.patch(existing._id, {
      status: 'ended',
      lastActiveAt: Date.now(),
    });

    return null;
  },
});

export const listLiveClassrooms = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.string(),
      roomID: v.string(),
      title: v.string(),
      hostName: v.string(),
      requiresPassword: v.boolean(),
      status: v.union(v.literal('live'), v.literal('ended')),
      startedAt: v.number(),
      lastActiveAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const now = Date.now();
    const cutoff = now - LIVE_TIMEOUT_MS;

    const rows = await ctx.db
      .query('liveClassrooms')
      .withIndex('by_status_lastActiveAt', (q) => q.eq('status', 'live').gte('lastActiveAt', cutoff))
      .order('desc')
      .collect();

    return rows.map((row) => ({
      _id: row._id.toString(),
      roomID: row.roomID,
      title: row.title,
      hostName: row.hostName,
      requiresPassword: Boolean(row.roomPassword),
      status: row.status,
      startedAt: row.startedAt,
      lastActiveAt: row.lastActiveAt,
    }));
  },
});

export const getClassroomAccess = query({
  args: {
    roomID: v.string(),
  },
  returns: v.object({
    exists: v.boolean(),
    requiresPassword: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('liveClassrooms')
      .withIndex('by_roomID', (q) => q.eq('roomID', args.roomID))
      .first();

    if (!row) {
      return {
        exists: false,
        requiresPassword: false,
      };
    }

    const isTimedOut = Date.now() - row.lastActiveAt > LIVE_TIMEOUT_MS;
    const isJoinable = row.status === 'live' && !isTimedOut;

    return {
      exists: isJoinable,
      requiresPassword: isJoinable ? Boolean(row.roomPassword) : false,
    };
  },
});

export const validateClassroomPassword = mutation({
  args: {
    roomID: v.string(),
    password: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('liveClassrooms')
      .withIndex('by_roomID', (q) => q.eq('roomID', args.roomID))
      .first();

    if (!row) {
      return false;
    }

    const isTimedOut = Date.now() - row.lastActiveAt > LIVE_TIMEOUT_MS;
    const isJoinable = row.status === 'live' && !isTimedOut;
    if (!isJoinable) {
      return false;
    }

    if (!row.roomPassword) {
      return true;
    }

    const isValid = row.roomPassword === args.password;
    if (isValid) {
      await ctx.db.patch(row._id, {
        lastActiveAt: Date.now(),
      });
    }

    return isValid;
  },
});
