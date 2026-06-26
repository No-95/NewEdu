import { mutation, query, internalMutation } from './_generated/server';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import { notifyUser } from './lib/notificationsHelper';

async function requireUser(ctx: QueryCtx | MutationCtx, email: string) {
  const user = await ctx.db
    .query('users')
    .withIndex('by_email', (q) => q.eq('email', email.trim().toLowerCase()))
    .first();
  if (!user) throw new Error('User not found.');
  return user;
}

export const upsertExpertProfile = mutation({
  args: {
    email: v.string(),
    displayName: v.string(),
    headline: v.string(),
    bio: v.optional(v.string()),
    industries: v.array(v.string()),
    expertise: v.array(v.string()),
    published: v.boolean(),
  },
  returns: v.object({ profileId: v.string() }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const now = Date.now();
    const existing = await ctx.db
      .query('expertProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();

    const payload = {
      displayName: args.displayName.trim(),
      headline: args.headline.trim(),
      bio: args.bio?.trim(),
      industries: args.industries.map((i) => i.trim()).filter(Boolean),
      expertise: args.expertise.map((e) => e.trim()).filter(Boolean),
      published: args.published,
      updatedAt: now,
    };

    let profileId;
    if (existing) {
      await ctx.db.patch(existing._id, payload);
      profileId = existing._id;
    } else {
      profileId = await ctx.db.insert('expertProfiles', {
        userId: user._id,
        ...payload,
        createdAt: now,
      });
    }
    return { profileId: profileId.toString() };
  },
});

export const getExpertProfileForEdit = query({
  args: { email: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      displayName: v.string(),
      headline: v.string(),
      bio: v.optional(v.string()),
      industries: v.array(v.string()),
      expertise: v.array(v.string()),
      published: v.boolean(),
    })
  ),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const profile = await ctx.db
      .query('expertProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();
    if (!profile) return null;
    return {
      displayName: profile.displayName,
      headline: profile.headline,
      bio: profile.bio,
      industries: profile.industries,
      expertise: profile.expertise,
      published: profile.published,
    };
  },
});

export const listPublishedExperts = query({
  args: {},
  returns: v.array(
    v.object({
      id: v.string(),
      displayName: v.string(),
      headline: v.string(),
      bio: v.optional(v.string()),
      industries: v.array(v.string()),
      expertise: v.array(v.string()),
      verified: v.boolean(),
    })
  ),
  handler: async (ctx) => {
    const profiles = await ctx.db
      .query('expertProfiles')
      .withIndex('by_published', (q) => q.eq('published', true))
      .collect();
    return profiles.map((p) => ({
      id: p.userId.toString(),
      displayName: p.displayName,
      headline: p.headline,
      bio: p.bio,
      industries: p.industries,
      expertise: p.expertise,
      verified: p.verified ?? false,
    }));
  },
});

export const getExpertMessagingContact = query({
  args: {
    requesterEmail: v.string(),
    expertUserId: v.string(),
  },
  returns: v.union(
    v.null(),
    v.object({
      email: v.string(),
      displayName: v.string(),
      avatarUrl: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const requester = await requireUser(ctx, args.requesterEmail);
    const expertUserId = args.expertUserId as Id<'users'>;

    if (requester._id === expertUserId) {
      return null;
    }

    const profile = await ctx.db
      .query('expertProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', expertUserId))
      .first();
    if (!profile?.published) return null;

    const expertUser = await ctx.db.get(expertUserId);
    if (!expertUser) return null;

    return {
      email: expertUser.email,
      displayName: profile.displayName,
      avatarUrl: expertUser.avatarUrl,
    };
  },
});

export const getExpertByUserId = query({
  args: { userId: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      id: v.string(),
      displayName: v.string(),
      headline: v.string(),
      bio: v.optional(v.string()),
      industries: v.array(v.string()),
      expertise: v.array(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const userId = args.userId as Id<'users'>;
    const profile = await ctx.db
      .query('expertProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();
    if (!profile || !profile.published) return null;
    return {
      id: profile.userId.toString(),
      displayName: profile.displayName,
      headline: profile.headline,
      bio: profile.bio,
      industries: profile.industries,
      expertise: profile.expertise,
    };
  },
});

export const submitConsultationRequest = mutation({
  args: {
    requesterEmail: v.string(),
    expertUserId: v.id('users'),
    topic: v.string(),
    message: v.string(),
  },
  returns: v.object({ requestId: v.string() }),
  handler: async (ctx, args) => {
    const requester = await requireUser(ctx, args.requesterEmail);
    const expertProfile = await ctx.db
      .query('expertProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', args.expertUserId))
      .first();
    if (!expertProfile?.published) throw new Error('Expert not found.');

    const now = Date.now();
    const requestId = await ctx.db.insert('expertConsultationRequests', {
      expertUserId: args.expertUserId,
      requesterUserId: requester._id,
      topic: args.topic.trim(),
      message: args.message.trim(),
      status: 'new',
      createdAt: now,
      updatedAt: now,
    });

    await notifyUser(ctx, {
      userId: args.expertUserId,
      type: 'consultation_request',
      title: 'New consultation request',
      body: `${requester.fullName?.trim() || requester.email}: ${args.topic.trim()}`,
      href: '/dashboard',
      params: {
        requesterName: requester.fullName?.trim() || requester.email,
        topic: args.topic.trim(),
      },
    });

    return { requestId: requestId.toString() };
  },
});

export const listRequestsForExpert = query({
  args: { email: v.string() },
  returns: v.array(
    v.object({
      id: v.string(),
      topic: v.string(),
      message: v.string(),
      status: v.string(),
      requesterName: v.string(),
      createdAt: v.number(),
      scheduledStart: v.optional(v.number()),
      scheduledEnd: v.optional(v.number()),
      meetingUrl: v.optional(v.string()),
      timezone: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const expert = await requireUser(ctx, args.email);
    const requests = await ctx.db
      .query('expertConsultationRequests')
      .withIndex('by_expertUserId', (q) => q.eq('expertUserId', expert._id))
      .collect();

    const results = [];
    for (const req of requests) {
      const requester = await ctx.db.get(req.requesterUserId);
      results.push({
        id: req._id.toString(),
        topic: req.topic,
        message: req.message,
        status: req.status,
        requesterName: requester?.fullName?.trim() || requester?.email || 'User',
        createdAt: req.createdAt,
        scheduledStart: req.scheduledStart,
        scheduledEnd: req.scheduledEnd,
        meetingUrl: req.meetingUrl,
        timezone: req.timezone,
      });
    }
    return results.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const listExpertEvents = query({
  args: {},
  returns: v.array(
    v.object({
      id: v.string(),
      slug: v.string(),
      title: v.string(),
      excerpt: v.string(),
      publishedAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const articles = await ctx.db
      .query('newsArticles')
      .withIndex('by_published_publishedAt', (q) => q.eq('published', true))
      .order('desc')
      .take(20);
    return articles
      .filter((a) => a.category === 'events' || a.tags.includes('expert'))
      .map((a) => ({
        id: a._id.toString(),
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        publishedAt: a.publishedAt,
      }));
  },
});

export const submitExpertApplication = mutation({
  args: {
    fullName: v.string(),
    email: v.string(),
    phone: v.string(),
    specialization: v.string(),
    bio: v.string(),
  },
  returns: v.object({ applicationId: v.string() }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert('expertApplications', {
      fullName: args.fullName.trim(),
      email: args.email.trim().toLowerCase(),
      phone: args.phone.trim(),
      specialization: args.specialization.trim(),
      bio: args.bio.trim(),
      status: 'submitted',
      createdAt: now,
      updatedAt: now,
    });
    return { applicationId: id.toString() };
  },
});

export const getMyExpertApplication = query({
  args: { email: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      id: v.string(),
      status: v.string(),
      specialization: v.string(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const apps = await ctx.db
      .query('expertApplications')
      .withIndex('by_email', (q) => q.eq('email', email))
      .collect();
    const latest = apps.sort((a, b) => b.createdAt - a.createdAt)[0];
    if (!latest) return null;
    return {
      id: latest._id.toString(),
      status: latest.status,
      specialization: latest.specialization,
      createdAt: latest.createdAt,
    };
  },
});

export const listExpertApplicationsForReview = query({
  args: { adminEmail: v.string() },
  returns: v.array(
    v.object({
      id: v.string(),
      fullName: v.string(),
      email: v.string(),
      specialization: v.string(),
      status: v.string(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.adminEmail.trim().toLowerCase()))
      .first();
    if (!admin || admin.role !== 'admin') return [];
    const apps = await ctx.db.query('expertApplications').order('desc').take(50);
    return apps.map((a) => ({
      id: a._id.toString(),
      fullName: a.fullName,
      email: a.email,
      specialization: a.specialization,
      status: a.status,
      createdAt: a.createdAt,
    }));
  },
});

export const listRequestsForRequester = query({
  args: { email: v.string() },
  returns: v.array(
    v.object({
      id: v.string(),
      topic: v.string(),
      message: v.string(),
      status: v.string(),
      expertName: v.string(),
      createdAt: v.number(),
      scheduledStart: v.optional(v.number()),
      scheduledEnd: v.optional(v.number()),
      meetingUrl: v.optional(v.string()),
      timezone: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const requester = await requireUser(ctx, args.email);
    const requests = await ctx.db
      .query('expertConsultationRequests')
      .withIndex('by_requesterUserId', (q) => q.eq('requesterUserId', requester._id))
      .collect();
    const results = [];
    for (const req of requests) {
      const expert = await ctx.db.get(req.expertUserId);
      const profile = await ctx.db
        .query('expertProfiles')
        .withIndex('by_userId', (q) => q.eq('userId', req.expertUserId))
        .first();
      results.push({
        id: req._id.toString(),
        topic: req.topic,
        message: req.message,
        status: req.status,
        expertName: profile?.displayName ?? expert?.fullName ?? 'Expert',
        createdAt: req.createdAt,
        scheduledStart: req.scheduledStart,
        scheduledEnd: req.scheduledEnd,
        meetingUrl: req.meetingUrl,
        timezone: req.timezone,
      });
    }
    return results.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const updateConsultationRequestStatus = mutation({
  args: {
    expertEmail: v.string(),
    requestId: v.id('expertConsultationRequests'),
    status: v.union(v.literal('accepted'), v.literal('closed')),
    scheduledStart: v.optional(v.number()),
    scheduledEnd: v.optional(v.number()),
    meetingUrl: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const expert = await requireUser(ctx, args.expertEmail);
    const request = await ctx.db.get(args.requestId);
    if (!request || request.expertUserId !== expert._id) throw new Error('Not found.');

    const now = Date.now();
    if (args.status === 'accepted') {
      if (!args.scheduledStart) throw new Error('Scheduled start time is required.');
      if (args.scheduledStart <= now) throw new Error('Scheduled time must be in the future.');
    }

    const scheduledEnd =
      args.scheduledEnd ??
      (args.scheduledStart ? args.scheduledStart + 30 * 60 * 1000 : undefined);

    await ctx.db.patch(args.requestId, {
      status: args.status,
      updatedAt: now,
      ...(args.status === 'accepted'
        ? {
            scheduledStart: args.scheduledStart,
            scheduledEnd,
            meetingUrl: args.meetingUrl?.trim() || undefined,
            timezone: args.timezone?.trim() || 'UTC',
            reminderSentAt: undefined,
          }
        : {}),
    });

    if (args.status === 'accepted' && args.scheduledStart) {
      const scheduledAt = new Date(args.scheduledStart).toLocaleString('en-US', {
        timeZone: args.timezone?.trim() || 'UTC',
      });
      await notifyUser(ctx, {
        userId: request.requesterUserId,
        type: 'consultation_scheduled',
        title: 'Consultation scheduled',
        body: `Your consultation "${request.topic}" is scheduled for ${scheduledAt}.`,
        href: '/career/consultations',
        params: { topic: request.topic, scheduledAt, meetingUrl: args.meetingUrl?.trim() || '' },
      });
    } else {
      await notifyUser(ctx, {
        userId: request.requesterUserId,
        type: 'consultation_closed',
        title: 'Consultation closed',
        body: `Your request "${request.topic}" was closed.`,
        href: '/career/consultations',
        params: { topic: request.topic },
      });
    }

    return { success: true };
  },
});

export const sendConsultationReminders = internalMutation({
  args: {},
  returns: v.object({ sent: v.number() }),
  handler: async (ctx) => {
    const now = Date.now();
    const windowStart = now + 23 * 60 * 60 * 1000;
    const windowEnd = now + 25 * 60 * 60 * 1000;
    const requests = await ctx.db.query('expertConsultationRequests').collect();
    let sent = 0;

    for (const request of requests) {
      if (request.status !== 'accepted' || !request.scheduledStart || request.reminderSentAt) continue;
      if (request.scheduledStart < windowStart || request.scheduledStart > windowEnd) continue;

      const scheduledAt = new Date(request.scheduledStart).toLocaleString('en-US', {
        timeZone: request.timezone || 'UTC',
      });
      await notifyUser(ctx, {
        userId: request.requesterUserId,
        type: 'consultation_reminder',
        title: 'Consultation reminder',
        body: `Your consultation "${request.topic}" starts at ${scheduledAt}.`,
        href: '/career/consultations',
        params: { topic: request.topic, scheduledAt, meetingUrl: request.meetingUrl || '' },
      });
      await ctx.db.patch(request._id, { reminderSentAt: now });
      sent += 1;
    }

    return { sent };
  },
});

export const markExpertApplicationInReview = mutation({
  args: {
    adminEmail: v.string(),
    applicationId: v.id('expertApplications'),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.adminEmail.trim().toLowerCase()))
      .first();
    if (!admin || admin.role !== 'admin') throw new Error('Unauthorized.');
    await ctx.db.patch(args.applicationId, { status: 'in_review', updatedAt: Date.now() });
    return { success: true };
  },
});

export const rejectExpertApplication = mutation({
  args: {
    adminEmail: v.string(),
    applicationId: v.id('expertApplications'),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.adminEmail.trim().toLowerCase()))
      .first();
    if (!admin || admin.role !== 'admin') throw new Error('Unauthorized.');
    await ctx.db.patch(args.applicationId, { status: 'rejected', updatedAt: Date.now() });
    return { success: true };
  },
});

export const acceptExpertApplication = mutation({
  args: {
    adminEmail: v.string(),
    applicationId: v.id('expertApplications'),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.adminEmail.trim().toLowerCase()))
      .first();
    if (!admin || admin.role !== 'admin') throw new Error('Unauthorized.');

    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error('Application not found.');

    const now = Date.now();
    await ctx.db.patch(args.applicationId, { status: 'accepted', updatedAt: now });

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', application.email))
      .first();
    if (!user) return { success: true };

    const onboarding = await ctx.db
      .query('userOnboarding')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();

    if (onboarding && !onboarding.roles.includes('expert')) {
      await ctx.db.patch(onboarding._id, {
        roles: [...onboarding.roles, 'expert'],
      });
    }

    await ctx.db.patch(user._id, { activeRole: 'expert', updatedAt: now });

    const existingProfile = await ctx.db
      .query('expertProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();
    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, { verified: true, updatedAt: now });
    }

    await notifyUser(ctx, {
      userId: user._id,
      type: 'expert_accepted',
      title: 'Expert application accepted',
      body: 'Welcome! Complete your expert profile to appear in the network.',
      href: '/experts/profile',
    });

    return { success: true };
  },
});
