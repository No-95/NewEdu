import { mutation, query } from './_generated/server';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { v } from 'convex/values';
import { computeCareerCompletionScoreFromProfileOnly } from './lib/careerScore';
import { computeSkillGaps } from './lib/skillGaps';

const educationValidator = v.object({
  school: v.string(),
  degree: v.string(),
  year: v.string(),
});

const skillValidator = v.object({
  name: v.string(),
  level: v.number(),
});

const certificateValidator = v.object({
  name: v.string(),
  issuer: v.string(),
  year: v.string(),
  storageId: v.optional(v.id('_storage')),
});

const experienceValidator = v.object({
  company: v.string(),
  role: v.string(),
  period: v.string(),
  description: v.string(),
});

const languageValidator = v.object({
  name: v.string(),
  level: v.string(),
});

const cvDraftValidator = v.object({
  location: v.optional(v.string()),
  education: v.array(educationValidator),
  skills: v.array(skillValidator),
  certificates: v.array(
    v.object({
      name: v.string(),
      issuer: v.string(),
      year: v.string(),
    })
  ),
  experience: v.array(experienceValidator),
  languages: v.array(languageValidator),
});

async function requireUser(ctx: QueryCtx | MutationCtx, email: string) {
  const user = await ctx.db
    .query('users')
    .withIndex('by_email', (q) => q.eq('email', email.trim().toLowerCase()))
    .first();
  if (!user) throw new Error('User not found.');
  return user;
}

export function computeCareerCompletionScore(profile: {
  location?: string;
  education: { school: string }[];
  skills: { name: string }[];
  experience: { company: string }[];
  languages: { name: string }[];
}) {
  return computeCareerCompletionScoreFromProfileOnly(profile);
}

export const upsertCareerProfile = mutation({
  args: {
    email: v.string(),
    location: v.optional(v.string()),
    education: v.array(educationValidator),
    skills: v.array(skillValidator),
    certificates: v.array(certificateValidator),
    experience: v.array(experienceValidator),
    languages: v.array(languageValidator),
  },
  returns: v.object({ profileId: v.string(), completionScore: v.number() }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const now = Date.now();
    const existing = await ctx.db
      .query('careerProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();

    const payload = {
      location: args.location?.trim(),
      education: args.education,
      skills: args.skills,
      certificates: args.certificates,
      experience: args.experience,
      languages: args.languages,
      updatedAt: now,
    };

    let profileId;
    if (existing) {
      await ctx.db.patch(existing._id, payload);
      profileId = existing._id;
    } else {
      profileId = await ctx.db.insert('careerProfiles', {
        userId: user._id,
        ...payload,
        createdAt: now,
      });
    }

    const completionScore = computeCareerCompletionScore({
      location: payload.location,
      education: payload.education,
      skills: payload.skills,
      experience: payload.experience,
      languages: payload.languages,
    });

    return { profileId: profileId.toString(), completionScore };
  },
});

export const getCareerProfileForEdit = query({
  args: { email: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      location: v.optional(v.string()),
      education: v.array(educationValidator),
      skills: v.array(skillValidator),
      certificates: v.array(certificateValidator),
      experience: v.array(experienceValidator),
      languages: v.array(languageValidator),
      completionScore: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const profile = await ctx.db
      .query('careerProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();
    if (!profile) return null;
    return {
      location: profile.location,
      education: profile.education,
      skills: profile.skills,
      certificates: profile.certificates,
      experience: profile.experience,
      languages: profile.languages,
      completionScore: computeCareerCompletionScore(profile),
    };
  },
});

export const generateCvUploadUrl = mutation({
  args: { email: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    await requireUser(ctx, args.email);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveCvStorageId = mutation({
  args: {
    email: v.string(),
    storageId: v.id('_storage'),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const existing = await ctx.db
      .query('careerProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();
    const now = Date.now();
    const patch = {
      cvStorageId: args.storageId,
      cvParseStatus: 'idle' as const,
      cvParseError: undefined,
      cvExtractedDraft: undefined,
      updatedAt: now,
    };
    if (existing) {
      await ctx.db.patch(existing._id, patch);
    } else {
      await ctx.db.insert('careerProfiles', {
        userId: user._id,
        education: [],
        skills: [],
        certificates: [],
        experience: [],
        languages: [],
        ...patch,
        createdAt: now,
      });
    }
    return { success: true };
  },
});

export const getCvDownloadUrl = query({
  args: { email: v.string() },
  returns: v.union(v.null(), v.object({ downloadUrl: v.string() })),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const profile = await ctx.db
      .query('careerProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();
    if (!profile?.cvStorageId) return null;
    const downloadUrl = await ctx.storage.getUrl(profile.cvStorageId);
    if (!downloadUrl) return null;
    return { downloadUrl };
  },
});

export const getCvParseStatus = query({
  args: { email: v.string() },
  returns: v.object({
    status: v.optional(
      v.union(
        v.literal('idle'),
        v.literal('parsing'),
        v.literal('ready'),
        v.literal('failed')
      )
    ),
    error: v.optional(v.string()),
    draft: v.optional(cvDraftValidator),
    hasCvOnFile: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const profile = await ctx.db
      .query('careerProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();
    return {
      status: profile?.cvParseStatus,
      error: profile?.cvParseError,
      draft: profile?.cvExtractedDraft,
      hasCvOnFile: Boolean(profile?.cvStorageId),
    };
  },
});

export const beginCvParse = mutation({
  args: { email: v.string() },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const profile = await ctx.db
      .query('careerProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();
    if (!profile?.cvStorageId) throw new Error('No CV uploaded.');
    await ctx.db.patch(profile._id, {
      cvParseStatus: 'parsing',
      cvParseError: undefined,
      cvExtractedDraft: undefined,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const completeCvParseDraft = mutation({
  args: {
    email: v.string(),
    draft: cvDraftValidator,
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const profile = await ctx.db
      .query('careerProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();
    if (!profile) throw new Error('Profile not found.');
    const now = Date.now();
    await ctx.db.patch(profile._id, {
      cvExtractedDraft: args.draft,
      cvParseStatus: 'ready',
      cvParsedAt: now,
      cvParseError: undefined,
      updatedAt: now,
    });
    return { success: true };
  },
});

export const failCvParse = mutation({
  args: {
    email: v.string(),
    error: v.string(),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const profile = await ctx.db
      .query('careerProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();
    if (!profile) throw new Error('Profile not found.');
    await ctx.db.patch(profile._id, {
      cvParseStatus: 'failed',
      cvParseError: args.error.slice(0, 500),
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const applyCvDraftToProfile = mutation({
  args: { email: v.string() },
  returns: v.object({ success: v.boolean(), completionScore: v.number() }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const profile = await ctx.db
      .query('careerProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();
    if (!profile?.cvExtractedDraft) throw new Error('No CV draft to apply.');

    const draft = profile.cvExtractedDraft;
    const now = Date.now();
    await ctx.db.patch(profile._id, {
      location: draft.location ?? profile.location,
      education: draft.education.length > 0 ? draft.education : profile.education,
      skills: draft.skills.length > 0 ? draft.skills : profile.skills,
      certificates:
        draft.certificates.length > 0
          ? draft.certificates.map((c) => ({ ...c, storageId: undefined }))
          : profile.certificates,
      experience: draft.experience.length > 0 ? draft.experience : profile.experience,
      languages: draft.languages.length > 0 ? draft.languages : profile.languages,
      cvParseStatus: 'ready',
      cvExtractedDraft: undefined,
      updatedAt: now,
    });

    const updated = await ctx.db.get(profile._id);
    const completionScore = computeCareerCompletionScore({
      location: updated?.location,
      education: updated?.education ?? [],
      skills: updated?.skills ?? [],
      experience: updated?.experience ?? [],
      languages: updated?.languages ?? [],
    });

    return { success: true, completionScore };
  },
});

function topikLevelFromLearnerStage(stage: string | undefined): string | null {
  switch (stage) {
    case 'topik_1_2':
      return 'TOPIK I (Levels 1–2 target)';
    case 'topik_3_4':
      return 'TOPIK II (Levels 3–4 target)';
    case 'topik_5_6':
      return 'TOPIK II (Levels 5–6 target)';
    case 'korean_none':
      return 'Beginner (pre-TOPIK)';
    case 'working_professional':
      return 'Working professional';
    default:
      return null;
  }
}

export const syncTopikLevelToCareerProfile = mutation({
  args: { email: v.string() },
  returns: v.object({ success: v.boolean(), level: v.optional(v.string()) }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const onboarding = await ctx.db
      .query('userOnboarding')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();
    const level = topikLevelFromLearnerStage(onboarding?.learnerStage);
    if (!level) {
      throw new Error('No TOPIK level found in your learner profile.');
    }

    const now = Date.now();
    const existing = await ctx.db
      .query('careerProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();

    const upsertLanguages = (languages: { name: string; level: string }[]) => {
      const filtered = languages.filter((entry) => entry.name.trim().toLowerCase() !== 'korean');
      return [...filtered, { name: 'Korean', level }];
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        languages: upsertLanguages(existing.languages),
        updatedAt: now,
      });
    } else {
      await ctx.db.insert('careerProfiles', {
        userId: user._id,
        education: [],
        skills: [],
        certificates: [],
        experience: [],
        languages: [{ name: 'Korean', level }],
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true, level };
  },
});

export const getAiMatchingResults = query({
  args: { email: v.string() },
  returns: v.object({
    jobs: v.array(
      v.object({
        id: v.string(),
        externalId: v.string(),
        title: v.string(),
        department: v.string(),
        companyName: v.string(),
        matchScore: v.number(),
      })
    ),
    courses: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        slug: v.string(),
      })
    ),
    experts: v.array(
      v.object({
        id: v.string(),
        displayName: v.string(),
        headline: v.string(),
      })
    ),
    skillGaps: v.array(v.string()),
    hasProfile: v.boolean(),
    hasCvOnFile: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const profile = await ctx.db
      .query('careerProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();

    const skillNames = new Set(
      (profile?.skills ?? []).map((s) => s.name.trim().toLowerCase()).filter(Boolean)
    );

    const openJobs = await ctx.db
      .query('recruitmentJobPostings')
      .withIndex('by_status', (q) => q.eq('status', 'open'))
      .collect();

    const jobs = [];
    for (const posting of openJobs) {
      const owner = await ctx.db.get(posting.ownerId);
      const haystack = `${posting.title} ${posting.department} ${posting.description ?? ''}`.toLowerCase();
      let matchScore = 40;
      for (const skill of skillNames) {
        if (haystack.includes(skill)) matchScore += 15;
      }
      jobs.push({
        id: posting._id.toString(),
        externalId: posting.externalId,
        title: posting.title,
        department: posting.department,
        companyName: owner?.fullName?.trim() || 'HDP Partner',
        matchScore: Math.min(100, matchScore),
      });
    }

    const courses = await ctx.db
      .query('courses')
      .withIndex('by_published', (q) => q.eq('published', true))
      .take(5);

    const experts = await ctx.db
      .query('expertProfiles')
      .withIndex('by_published', (q) => q.eq('published', true))
      .take(5);

    return {
      jobs: jobs.sort((a, b) => b.matchScore - a.matchScore).slice(0, 8),
      courses: courses.map((c) => ({
        id: c._id.toString(),
        title: c.title,
        slug: c.slug,
      })),
      experts: experts.map((e) => ({
        id: e.userId.toString(),
        displayName: e.displayName,
        headline: e.headline,
      })),
      skillGaps: computeSkillGaps(profile?.skills, openJobs),
      hasProfile: Boolean(profile && profile.skills.length > 0),
      hasCvOnFile: Boolean(profile?.cvStorageId),
    };
  },
});
