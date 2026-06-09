import type { RoleKey } from '@/lib/onboarding/schema';

export const ROLE_LABEL_KEYS: Record<RoleKey, string> = {
  learner: 'onboarding.step1.options.learner',
  teacher: 'onboarding.step1.options.teacher',
  training_center: 'onboarding.step1.options.training_center',
  job_seeker: 'onboarding.step1.options.job_seeker',
  employer: 'onboarding.step1.options.employer',
  expert: 'onboarding.step1.options.expert',
};

export function getRoleLabelKey(roleKey: string): string {
  if (roleKey in ROLE_LABEL_KEYS) {
    return ROLE_LABEL_KEYS[roleKey as RoleKey];
  }
  return ROLE_LABEL_KEYS.learner;
}

export function formatTemplate(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    template
  );
}
