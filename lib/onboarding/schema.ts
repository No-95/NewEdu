import { z } from 'zod';

export const ONBOARDING_VERSION = 1;

export const ROLE_KEYS = [
  'learner',
  'teacher',
  'training_center',
  'job_seeker',
  'employer',
  'expert',
] as const;

export const GOAL_KEYS = [
  'learn_korean',
  'find_job',
  'recruit',
  'find_partner',
  'personal_brand',
  'share_knowledge',
  'find_expert',
  'other',
] as const;

export const INDUSTRY_KEYS = [
  'manufacturing',
  'trade_import_export',
  'hr_accounting',
  'technology',
  'education',
  'translation',
  'other',
] as const;

export const LEARNER_STAGE_KEYS = [
  'korean_none',
  'topik_1_2',
  'topik_3_4',
  'topik_5_6',
  'working_professional',
] as const;

export const JOB_SEEKER_STAGE_KEYS = [
  'student',
  'fresh_graduate',
  'exp_1_3',
  'exp_3_5',
  'exp_5_plus',
] as const;

export const EMPLOYER_STAGE_KEYS = [
  'size_under_10',
  'size_10_50',
  'size_50_200',
  'size_200_plus',
] as const;

export const MARKETING_INTEREST_KEYS = [
  'jobs',
  'courses',
  'events',
  'materials',
  'seminars',
  'business_opportunities',
  'investment',
  'import_export',
] as const;

export const ONBOARDING_LIMITS = {
  maxRoles: 3,
  minRoles: 1,
  maxGoals: 3,
  minGoals: 1,
  maxIndustries: 5,
  minIndustries: 1,
  minMarketingInterests: 1,
  otherTextMaxLength: 200,
} as const;

export type RoleKey = (typeof ROLE_KEYS)[number];
export type GoalKey = (typeof GOAL_KEYS)[number];
export type IndustryKey = (typeof INDUSTRY_KEYS)[number];
export type LearnerStageKey = (typeof LEARNER_STAGE_KEYS)[number];
export type JobSeekerStageKey = (typeof JOB_SEEKER_STAGE_KEYS)[number];
export type EmployerStageKey = (typeof EMPLOYER_STAGE_KEYS)[number];
export type MarketingInterestKey = (typeof MARKETING_INTEREST_KEYS)[number];

export const onboardingSurveySchema = z
  .object({
    roles: z
      .array(z.enum(ROLE_KEYS))
      .min(ONBOARDING_LIMITS.minRoles)
      .max(ONBOARDING_LIMITS.maxRoles),
    goals: z
      .array(z.enum(GOAL_KEYS))
      .min(ONBOARDING_LIMITS.minGoals)
      .max(ONBOARDING_LIMITS.maxGoals),
    goalOtherText: z.string().trim().max(ONBOARDING_LIMITS.otherTextMaxLength).optional(),
    industries: z
      .array(z.enum(INDUSTRY_KEYS))
      .min(ONBOARDING_LIMITS.minIndustries)
      .max(ONBOARDING_LIMITS.maxIndustries),
    industryOtherText: z.string().trim().max(ONBOARDING_LIMITS.otherTextMaxLength).optional(),
    learnerStage: z.enum(LEARNER_STAGE_KEYS).optional(),
    jobSeekerStage: z.enum(JOB_SEEKER_STAGE_KEYS).optional(),
    employerStage: z.enum(EMPLOYER_STAGE_KEYS).optional(),
    marketingInterests: z
      .array(z.enum(MARKETING_INTEREST_KEYS))
      .min(ONBOARDING_LIMITS.minMarketingInterests),
  })
  .superRefine((data, ctx) => {
    const uniqueRoles = new Set(data.roles);
    if (uniqueRoles.size !== data.roles.length) {
      ctx.addIssue({ code: 'custom', message: 'Duplicate roles are not allowed.', path: ['roles'] });
    }

    if (data.goals.includes('other') && !data.goalOtherText?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'goalOtherText is required when goal "other" is selected.',
        path: ['goalOtherText'],
      });
    }

    if (data.industries.includes('other') && !data.industryOtherText?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'industryOtherText is required when industry "other" is selected.',
        path: ['industryOtherText'],
      });
    }

    if (data.roles.includes('learner') && !data.learnerStage) {
      ctx.addIssue({
        code: 'custom',
        message: 'learnerStage is required when role "learner" is selected.',
        path: ['learnerStage'],
      });
    }

    if (data.roles.includes('job_seeker') && !data.jobSeekerStage) {
      ctx.addIssue({
        code: 'custom',
        message: 'jobSeekerStage is required when role "job_seeker" is selected.',
        path: ['jobSeekerStage'],
      });
    }

    if (data.roles.includes('employer') && !data.employerStage) {
      ctx.addIssue({
        code: 'custom',
        message: 'employerStage is required when role "employer" is selected.',
        path: ['employerStage'],
      });
    }
  });

export type OnboardingSurveyInput = z.infer<typeof onboardingSurveySchema>;

export function getStageKeyForRole(
  roleKey: RoleKey,
  data: Pick<
    OnboardingSurveyInput,
    'learnerStage' | 'jobSeekerStage' | 'employerStage'
  >
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

export function formatHdpId(sequence: number): string {
  return `HDP-${String(sequence).padStart(8, '0')}`;
}
