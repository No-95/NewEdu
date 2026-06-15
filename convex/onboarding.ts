import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const ONBOARDING_VERSION = 1;

const ROLE_KEYS = [
  'learner',
  'teacher',
  'training_center',
  'job_seeker',
  'employer',
  'expert',
] as const;

const GOAL_KEYS = [
  'learn_korean',
  'find_job',
  'recruit',
  'find_partner',
  'personal_brand',
  'share_knowledge',
  'find_expert',
  'other',
] as const;

const INDUSTRY_KEYS = [
  'manufacturing',
  'trade_import_export',
  'hr_accounting',
  'technology',
  'education',
  'translation',
  'other',
] as const;

const LEARNER_STAGE_KEYS = [
  'korean_none',
  'topik_1_2',
  'topik_3_4',
  'topik_5_6',
  'working_professional',
] as const;

const JOB_SEEKER_STAGE_KEYS = [
  'student',
  'fresh_graduate',
  'exp_1_3',
  'exp_3_5',
  'exp_5_plus',
] as const;

const EMPLOYER_STAGE_KEYS = [
  'size_under_10',
  'size_10_50',
  'size_50_200',
  'size_200_plus',
] as const;

const MARKETING_INTEREST_KEYS = [
  'jobs',
  'courses',
  'events',
  'materials',
  'seminars',
  'business_opportunities',
  'investment',
  'import_export',
] as const;

const MAX_ROLES = 3;
const MIN_ROLES = 1;
const MAX_GOALS = 3;
const MIN_GOALS = 1;
const MAX_INDUSTRIES = 5;
const MIN_INDUSTRIES = 1;
const MIN_MARKETING = 1;
const OTHER_TEXT_MAX = 200;

type RoleKey = (typeof ROLE_KEYS)[number];

const surveyArgs = {
  email: v.string(),
  roles: v.array(v.string()),
  goals: v.array(v.string()),
  goalOtherText: v.optional(v.string()),
  industries: v.array(v.string()),
  industryOtherText: v.optional(v.string()),
  learnerStage: v.optional(v.string()),
  jobSeekerStage: v.optional(v.string()),
  employerStage: v.optional(v.string()),
  marketingInterests: v.array(v.string()),
};

function isOneOf<T extends string>(value: string, allowed: readonly T[]): value is T {
  return (allowed as readonly string[]).includes(value);
}

function assertUnique(values: string[], field: string) {
  if (new Set(values).size !== values.length) {
    throw new Error(`Duplicate values are not allowed in ${field}.`);
  }
}

function assertStringArray(
  values: string[],
  allowed: readonly string[],
  field: string,
  min: number,
  max?: number
) {
  if (values.length < min) {
    throw new Error(`${field} must include at least ${min} selection(s).`);
  }
  if (max !== undefined && values.length > max) {
    throw new Error(`${field} must include at most ${max} selection(s).`);
  }
  assertUnique(values, field);
  for (const value of values) {
    if (!isOneOf(value, allowed)) {
      throw new Error(`Invalid ${field} value: ${value}`);
    }
  }
}

function assertOptionalText(value: string | undefined, field: string) {
  if (value === undefined) return;
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error(`${field} cannot be empty.`);
  }
  if (trimmed.length > OTHER_TEXT_MAX) {
    throw new Error(`${field} must be at most ${OTHER_TEXT_MAX} characters.`);
  }
}

function validateSurveyInput(args: {
  roles: string[];
  goals: string[];
  goalOtherText?: string;
  industries: string[];
  industryOtherText?: string;
  learnerStage?: string;
  jobSeekerStage?: string;
  employerStage?: string;
  marketingInterests: string[];
}) {
  assertStringArray(args.roles, ROLE_KEYS, 'roles', MIN_ROLES, MAX_ROLES);
  assertStringArray(args.goals, GOAL_KEYS, 'goals', MIN_GOALS, MAX_GOALS);
  assertStringArray(args.industries, INDUSTRY_KEYS, 'industries', MIN_INDUSTRIES, MAX_INDUSTRIES);
  assertStringArray(args.marketingInterests, MARKETING_INTEREST_KEYS, 'marketingInterests', MIN_MARKETING);

  assertOptionalText(args.goalOtherText, 'goalOtherText');
  assertOptionalText(args.industryOtherText, 'industryOtherText');

  if (args.goals.includes('other') && !args.goalOtherText?.trim()) {
    throw new Error('goalOtherText is required when goal "other" is selected.');
  }

  if (args.industries.includes('other') && !args.industryOtherText?.trim()) {
    throw new Error('industryOtherText is required when industry "other" is selected.');
  }

  if (args.roles.includes('learner')) {
    if (!args.learnerStage || !isOneOf(args.learnerStage, LEARNER_STAGE_KEYS)) {
      throw new Error('learnerStage is required and must be valid when role "learner" is selected.');
    }
  }

  if (args.roles.includes('job_seeker')) {
    if (!args.jobSeekerStage || !isOneOf(args.jobSeekerStage, JOB_SEEKER_STAGE_KEYS)) {
      throw new Error('jobSeekerStage is required and must be valid when role "job_seeker" is selected.');
    }
  }

  if (args.roles.includes('employer')) {
    if (!args.employerStage || !isOneOf(args.employerStage, EMPLOYER_STAGE_KEYS)) {
      throw new Error('employerStage is required and must be valid when role "employer" is selected.');
    }
  }

  return {
    roles: args.roles as RoleKey[],
    goals: args.goals,
    goalOtherText: args.goalOtherText?.trim() || undefined,
    industries: args.industries,
    industryOtherText: args.industryOtherText?.trim() || undefined,
    learnerStage: args.learnerStage,
    jobSeekerStage: args.jobSeekerStage,
    employerStage: args.employerStage,
    marketingInterests: args.marketingInterests,
  };
}

function getStageKeyForRole(
  roleKey: RoleKey,
  data: {
    learnerStage?: string;
    jobSeekerStage?: string;
    employerStage?: string;
  }
): string | undefined {
  switch (roleKey) {
    case 'learner':
      return data.learnerStage;
    case 'job_seeker':
      return data.jobSeekerStage;
    case 'employer':
      return data.employerStage;
    default:
      return undefined;
  }
}

function formatHdpId(sequence: number): string {
  return `HDP-${String(sequence).padStart(8, '0')}`;
}

async function allocateHdpId(ctx: { db: any }): Promise<string> {
  const existing = await ctx.db
    .query('hdpIdSequences')
    .withIndex('by_name', (q: any) => q.eq('name', 'default'))
    .first();

  let nextValue: number;

  if (!existing) {
    nextValue = 1;
    await ctx.db.insert('hdpIdSequences', { name: 'default', lastValue: nextValue });
  } else {
    nextValue = existing.lastValue + 1;
    await ctx.db.patch(existing._id, { lastValue: nextValue });
  }

  return formatHdpId(nextValue);
}

export const getOnboardingStatus = query({
  args: { email: v.string() },
  returns: v.object({
    required: v.boolean(),
    completed: v.boolean(),
    hdpId: v.union(v.string(), v.null()),
    activeRole: v.union(v.string(), v.null()),
    roles: v.array(v.string()),
    onboardingVersion: v.union(v.number(), v.null()),
  }),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email.trim().toLowerCase()))
      .first();

    if (!user) {
      return {
        required: false,
        completed: false,
        hdpId: null,
        activeRole: null,
        roles: [],
        onboardingVersion: null,
      };
    }

    const onboarding = await ctx.db
      .query('userOnboarding')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();

    const completed =
      user.onboardingCompletedAt !== undefined || onboarding !== null;

    return {
      required: user.onboardingRequired === true,
      completed,
      hdpId: user.hdpId ?? null,
      activeRole: user.activeRole ?? null,
      roles: onboarding?.roles ?? [],
      onboardingVersion: user.onboardingVersion ?? null,
    };
  },
});

export const submitOnboardingSurvey = mutation({
  args: surveyArgs,
  returns: v.object({
    hdpId: v.string(),
    activeRole: v.string(),
    roles: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', normalizedEmail))
      .first();

    if (!user) {
      throw new Error('User not found.');
    }

    if (user.onboardingCompletedAt !== undefined) {
      throw new Error('Onboarding survey has already been completed.');
    }

    const existingOnboarding = await ctx.db
      .query('userOnboarding')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();

    if (existingOnboarding) {
      throw new Error('Onboarding survey has already been completed.');
    }

    if (user.onboardingRequired !== true) {
      throw new Error('Onboarding survey is not required for this account.');
    }

    const validated = validateSurveyInput(args);
    const now = Date.now();
    const hdpId = await allocateHdpId(ctx);

    await ctx.db.insert('userOnboarding', {
      userId: user._id,
      version: ONBOARDING_VERSION,
      roles: validated.roles,
      goals: validated.goals,
      goalOtherText: validated.goalOtherText,
      industries: validated.industries,
      industryOtherText: validated.industryOtherText,
      learnerStage: validated.learnerStage,
      jobSeekerStage: validated.jobSeekerStage,
      employerStage: validated.employerStage,
      marketingInterests: validated.marketingInterests,
      submittedAt: now,
    });

    for (const roleKey of validated.roles) {
      const existingProfile = await ctx.db
        .query('userRoleProfiles')
        .withIndex('by_userId_roleKey', (q) => q.eq('userId', user._id).eq('roleKey', roleKey))
        .first();

      const stageKey = getStageKeyForRole(roleKey, validated);

      if (existingProfile) {
        await ctx.db.patch(existingProfile._id, {
          stageKey,
          enabled: true,
          updatedAt: now,
        });
      } else {
        await ctx.db.insert('userRoleProfiles', {
          userId: user._id,
          roleKey,
          stageKey,
          headline: undefined,
          bio: undefined,
          companyName: undefined,
          experienceSummary: undefined,
          enabled: true,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    const activeRole = validated.roles[0];

    await ctx.db.patch(user._id, {
      hdpId,
      onboardingCompletedAt: now,
      onboardingVersion: ONBOARDING_VERSION,
      onboardingRequired: false,
      activeRole,
      updatedAt: now,
    });

    return {
      hdpId,
      activeRole,
      roles: validated.roles,
    };
  },
});

export const setActiveRole = mutation({
  args: {
    email: v.string(),
    roleKey: v.string(),
  },
  returns: v.object({ activeRole: v.string() }),
  handler: async (ctx, args) => {
    if (!isOneOf(args.roleKey, ROLE_KEYS)) {
      throw new Error('Invalid roleKey.');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email.trim().toLowerCase()))
      .first();

    if (!user) {
      throw new Error('User not found.');
    }

    if (user.onboardingCompletedAt === undefined) {
      throw new Error('Onboarding must be completed before switching roles.');
    }

    const roleProfile = await ctx.db
      .query('userRoleProfiles')
      .withIndex('by_userId_roleKey', (q) =>
        q.eq('userId', user._id).eq('roleKey', args.roleKey)
      )
      .first();

    if (!roleProfile || !roleProfile.enabled) {
      throw new Error('Role is not enabled for this user.');
    }

    await ctx.db.patch(user._id, {
      activeRole: args.roleKey,
      updatedAt: Date.now(),
    });

    return { activeRole: args.roleKey };
  },
});

export const updateRoleProfile = mutation({
  args: {
    email: v.string(),
    roleKey: v.string(),
    headline: v.optional(v.string()),
    bio: v.optional(v.string()),
    companyName: v.optional(v.string()),
    experienceSummary: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    if (!isOneOf(args.roleKey, ROLE_KEYS)) {
      throw new Error('Invalid roleKey.');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email.trim().toLowerCase()))
      .first();

    if (!user) {
      throw new Error('User not found.');
    }

    const roleProfile = await ctx.db
      .query('userRoleProfiles')
      .withIndex('by_userId_roleKey', (q) =>
        q.eq('userId', user._id).eq('roleKey', args.roleKey)
      )
      .first();

    if (!roleProfile || !roleProfile.enabled) {
      throw new Error('Role profile not found.');
    }

    const patch: Record<string, string | number | undefined> = { updatedAt: Date.now() };
    if (args.headline !== undefined) patch.headline = args.headline.trim();
    if (args.bio !== undefined) patch.bio = args.bio.trim();
    if (args.companyName !== undefined) patch.companyName = args.companyName.trim();
    if (args.experienceSummary !== undefined) patch.experienceSummary = args.experienceSummary.trim();

    await ctx.db.patch(roleProfile._id, patch);
    return { success: true };
  },
});

export const getRoleProfiles = query({
  args: { email: v.string() },
  returns: v.array(
    v.object({
      roleKey: v.string(),
      stageKey: v.union(v.string(), v.null()),
      headline: v.union(v.string(), v.null()),
      bio: v.union(v.string(), v.null()),
      companyName: v.union(v.string(), v.null()),
      experienceSummary: v.union(v.string(), v.null()),
      enabled: v.boolean(),
    })
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email.trim().toLowerCase()))
      .first();

    if (!user) {
      return [];
    }

    const profiles = await ctx.db
      .query('userRoleProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();

    return profiles.map((profile) => ({
      roleKey: profile.roleKey,
      stageKey: profile.stageKey ?? null,
      headline: profile.headline ?? null,
      bio: profile.bio ?? null,
      companyName: profile.companyName ?? null,
      experienceSummary: profile.experienceSummary ?? null,
      enabled: profile.enabled,
    }));
  },
});
