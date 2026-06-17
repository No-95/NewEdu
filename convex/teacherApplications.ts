import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { notifyUser } from './lib/notificationsHelper';

export const submitTeacherApplication = mutation({
  args: {
    fullName: v.string(),
    email: v.string(),
    phone: v.string(),
    experienceYears: v.string(),
    specialization: v.string(),
    certifications: v.optional(v.string()),
    nativeLanguage: v.string(),
    hoursAvailable: v.string(),
    bio: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const existing = await ctx.db
      .query('teacherApplications')
      .withIndex('by_email', (q) => q.eq('email', email))
      .collect();
    const active = existing.find((a) => a.status !== 'rejected');
    if (active) throw new Error('An application is already on file for this email.');

    const now = Date.now();
    const applicationId = await ctx.db.insert('teacherApplications', {
      fullName: args.fullName,
      email: args.email.trim().toLowerCase(),
      phone: args.phone,
      experienceYears: args.experienceYears,
      specialization: args.specialization,
      certifications: args.certifications,
      nativeLanguage: args.nativeLanguage,
      hoursAvailable: args.hoursAvailable,
      bio: args.bio,
      status: 'submitted',
      createdAt: now,
      updatedAt: now,
    });

    return applicationId.toString();
  },
});

export const listRecentTeacherApplications = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.string(),
      fullName: v.string(),
      specialization: v.string(),
      status: v.string(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 3;
    const applications = await ctx.db.query('teacherApplications').order('desc').take(limit);

    return applications.map((application) => ({
      _id: application._id.toString(),
      fullName: application.fullName,
      specialization: application.specialization,
      status: application.status,
      createdAt: application.createdAt,
    }));
  },
});

export const listTeacherApplicationsForReview = query({
  args: { adminEmail: v.string() },
  returns: v.array(
    v.object({
      _id: v.string(),
      fullName: v.string(),
      email: v.string(),
      phone: v.string(),
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

    const applications = await ctx.db.query('teacherApplications').order('desc').take(50);
    return applications.map((application) => ({
      _id: application._id.toString(),
      fullName: application.fullName,
      email: application.email,
      phone: application.phone,
      specialization: application.specialization,
      status: application.status,
      createdAt: application.createdAt,
    }));
  },
});

export const acceptTeacherApplication = mutation({
  args: {
    adminEmail: v.string(),
    applicationId: v.id('teacherApplications'),
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

    if (onboarding && !onboarding.roles.includes('teacher')) {
      await ctx.db.patch(onboarding._id, {
        roles: [...onboarding.roles, 'teacher'],
      });
    } else if (!onboarding) {
      await ctx.db.insert('userOnboarding', {
        userId: user._id,
        version: 1,
        roles: ['teacher'],
        goals: [],
        industries: [],
        marketingInterests: [],
        submittedAt: now,
      });
    }

    const existingProfile = await ctx.db
      .query('userRoleProfiles')
      .withIndex('by_userId_roleKey', (q) => q.eq('userId', user._id).eq('roleKey', 'teacher'))
      .first();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, { enabled: true, updatedAt: now });
    } else {
      await ctx.db.insert('userRoleProfiles', {
        userId: user._id,
        roleKey: 'teacher',
        stageKey: undefined,
        headline: application.specialization,
        bio: application.bio,
        enabled: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    await ctx.db.patch(user._id, { activeRole: 'teacher', updatedAt: now });

    await notifyUser(ctx, {
      userId: user._id,
      type: 'teacher_accepted',
      title: 'Teacher application accepted',
      body: 'Welcome! Open your teacher dashboard to get started.',
      href: '/dashboard',
      params: {},
    });

    return { success: true };
  },
});

export const getMyTeacherApplication = query({
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
      .query('teacherApplications')
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

export const rejectTeacherApplication = mutation({
  args: {
    adminEmail: v.string(),
    applicationId: v.id('teacherApplications'),
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
    await ctx.db.patch(args.applicationId, { status: 'rejected', updatedAt: Date.now() });
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', application.email))
      .first();
    if (user) {
      await notifyUser(ctx, {
        userId: user._id,
        type: 'teacher_rejected',
        title: 'Teacher application update',
        body: 'Your teacher application was not approved at this time.',
        href: '/teacher-applicant',
        params: {},
      });
    }
    return { success: true };
  },
});

export const markTeacherApplicationInReview = mutation({
  args: {
    adminEmail: v.string(),
    applicationId: v.id('teacherApplications'),
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
