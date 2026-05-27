import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

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
      email: v.string(),
      phone: v.string(),
      experienceYears: v.string(),
      specialization: v.string(),
      certifications: v.optional(v.string()),
      nativeLanguage: v.string(),
      hoursAvailable: v.string(),
      bio: v.string(),
      status: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 3;
    const applications = await ctx.db.query('teacherApplications').order('desc').take(limit);

    return applications.map((application) => ({
      _id: application._id.toString(),
      fullName: application.fullName,
      email: application.email,
      phone: application.phone,
      experienceYears: application.experienceYears,
      specialization: application.specialization,
      certifications: application.certifications,
      nativeLanguage: application.nativeLanguage,
      hoursAvailable: application.hoursAvailable,
      bio: application.bio,
      status: application.status,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    }));
  },
});
