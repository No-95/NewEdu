import { mutation, query } from './_generated/server';
import type { QueryCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';

async function requireUser(ctx: QueryCtx, email: string) {
  const user = await ctx.db
    .query('users')
    .withIndex('by_email', (q) => q.eq('email', email.trim().toLowerCase()))
    .first();

  if (!user) {
    throw new Error('User not found.');
  }

  return user;
}

function normalizeTags(tags: string[]) {
  return [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))].slice(0, 8);
}

export const listForumPosts = query({
  args: {
    tag: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const posts = await ctx.db.query('forumPosts').withIndex('by_createdAt').order('desc').take(200);

    const tag = args.tag?.trim().toLowerCase();
    const search = args.search?.trim().toLowerCase();

    const filtered = posts.filter((post) => {
      if (tag && !post.tags.includes(tag)) return false;
      if (!search) return true;
      const haystack = `${post.title} ${post.body} ${post.authorName} ${post.tags.join(' ')}`.toLowerCase();
      return haystack.includes(search);
    });

    return filtered.slice(0, limit).map((post) => ({
      id: post._id.toString(),
      authorName: post.authorName,
      title: post.title,
      body: post.body,
      tags: post.tags,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));
  },
});

export const getForumPost = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id as Id<'forumPosts'>);
    if (!post) return null;

    return {
      id: post._id.toString(),
      authorName: post.authorName,
      title: post.title,
      body: post.body,
      tags: post.tags,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  },
});

export const listForumTags = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query('forumPosts').collect();
    const counts = new Map<string, number>();

    for (const post of posts) {
      for (const tag of post.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }

    return [...counts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  },
});

export const createForumPost = mutation({
  args: {
    email: v.string(),
    title: v.string(),
    body: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const title = args.title.trim();
    const body = args.body.trim();

    if (!title || !body) {
      throw new Error('Title and body are required.');
    }

    const now = Date.now();
    const id = await ctx.db.insert('forumPosts', {
      authorId: user._id,
      authorName: user.fullName?.trim() || user.name?.trim() || user.email.split('@')[0],
      title,
      body,
      tags: normalizeTags(args.tags),
      createdAt: now,
      updatedAt: now,
    });

    return id.toString();
  },
});
