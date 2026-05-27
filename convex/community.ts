import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const listCommunityFeed = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.string(),
      authorName: v.string(),
      authorHandle: v.string(),
      authorAvatar: v.string(),
      content: v.string(),
      mediaType: v.union(v.literal('none'), v.literal('image'), v.literal('video')),
      mediaUrl: v.optional(v.string()),
      tag: v.optional(v.string()),
      likesCount: v.number(),
      comments: v.array(
        v.object({
          _id: v.id('communityComments'),
          authorName: v.string(),
          content: v.string(),
          createdAt: v.number(),
        })
      ),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const posts = await ctx.db.query('communityPosts').order('desc').take(limit);

    const feed = [];

    for (const post of posts) {
      const comments = await ctx.db
        .query('communityComments')
        .withIndex('by_postId', (q) => q.eq('postId', post._id))
        .order('asc')
        .collect();

      feed.push({
        _id: post._id,
        authorName: post.authorName,
        authorHandle: post.authorHandle,
        authorAvatar: post.authorAvatar,
        content: post.content,
        mediaType: post.mediaType,
        mediaUrl: post.mediaUrl,
        tag: post.tag ?? post.tags?.[0],
        likesCount: post.likesCount,
        comments: comments.map((comment) => ({
          _id: comment._id,
          authorName: comment.authorName,
          content: comment.content,
          createdAt: comment.createdAt,
        })),
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      });
    }

    return feed;
  },
});

export const createCommunityPost = mutation({
  args: {
    authorName: v.optional(v.string()),
    authorHandle: v.optional(v.string()),
    content: v.string(),
    mediaType: v.union(v.literal('none'), v.literal('image'), v.literal('video')),
    mediaUrl: v.optional(v.string()),
    tag: v.optional(v.string()),
  },
  returns: v.id('communityPosts'),
  handler: async (ctx, args) => {
    const now = Date.now();
    const normalizedName = (args.authorName?.trim() || 'Community Learner').slice(0, 60);
    const handleBase = (args.authorHandle?.trim() || normalizedName.replace(/\s+/g, '').toLowerCase() || 'learner')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .slice(0, 20)
      .toLowerCase();

    const postId = await ctx.db.insert('communityPosts', {
      authorId: undefined,
      authorName: normalizedName,
      authorHandle: `@${handleBase || 'learner'}`,
      authorAvatar: normalizedName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((segment) => segment[0]?.toUpperCase() ?? '')
        .join('') || 'CL',
      content: args.content,
      mediaType: args.mediaType,
      mediaUrl: args.mediaUrl,
      tag: args.tag,
      likesCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return postId;
  },
});

export const addCommunityComment = mutation({
  args: {
    postId: v.id('communityPosts'),
    authorName: v.optional(v.string()),
    content: v.string(),
  },
  returns: v.id('communityComments'),
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error('Post not found.');
    }

    const normalizedName = (args.authorName?.trim() || 'Community Learner').slice(0, 60);
    const now = Date.now();
    const commentId = await ctx.db.insert('communityComments', {
      postId: args.postId,
      authorId: undefined,
      authorName: normalizedName,
      content: args.content,
      createdAt: now,
    });

    return commentId;
  },
});

export const updateCommunityLikeCount = mutation({
  args: {
    postId: v.id('communityPosts'),
    delta: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error('Post not found.');
    }

    await ctx.db.patch(post._id, {
      likesCount: Math.max(0, post.likesCount + args.delta),
      updatedAt: Date.now(),
    });

    return null;
  },
});

export const removeMockCommunityData = mutation({
  args: {},
  returns: v.object({ removedPosts: v.number(), removedComments: v.number() }),
  handler: async (ctx) => {
    const mockHandles = new Set(['@sarahlearns', '@jparkedu', '@mariahr']);
    const posts = await ctx.db.query('communityPosts').collect();

    let removedPosts = 0;
    let removedComments = 0;

    for (const post of posts) {
      if (!mockHandles.has(post.authorHandle)) {
        continue;
      }

      const comments = await ctx.db
        .query('communityComments')
        .withIndex('by_postId', (q) => q.eq('postId', post._id))
        .collect();

      for (const comment of comments) {
        await ctx.db.delete(comment._id);
        removedComments += 1;
      }

      await ctx.db.delete(post._id);
      removedPosts += 1;
    }

    return { removedPosts, removedComments };
  },
});
