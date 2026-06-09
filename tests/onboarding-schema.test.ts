import { describe, expect, it } from 'vitest';
import { onboardingSurveySchema, formatHdpId } from '../lib/onboarding/schema';

describe('onboardingSurveySchema', () => {
  it('accepts a valid learner + job_seeker payload', () => {
    const result = onboardingSurveySchema.safeParse({
      roles: ['learner', 'job_seeker'],
      goals: ['learn_korean', 'find_job'],
      industries: ['manufacturing'],
      learnerStage: 'topik_3_4',
      jobSeekerStage: 'exp_1_3',
      marketingInterests: ['courses', 'jobs'],
    });

    expect(result.success).toBe(true);
  });

  it('requires goalOtherText when other goal is selected', () => {
    const result = onboardingSurveySchema.safeParse({
      roles: ['expert'],
      goals: ['other'],
      industries: ['education'],
      marketingInterests: ['seminars'],
    });

    expect(result.success).toBe(false);
  });

  it('requires learnerStage when learner role is selected', () => {
    const result = onboardingSurveySchema.safeParse({
      roles: ['learner'],
      goals: ['learn_korean'],
      industries: ['education'],
      marketingInterests: ['courses'],
    });

    expect(result.success).toBe(false);
  });
});

describe('formatHdpId', () => {
  it('zero-pads to 8 digits', () => {
    expect(formatHdpId(1258)).toBe('HDP-00001258');
  });
});
