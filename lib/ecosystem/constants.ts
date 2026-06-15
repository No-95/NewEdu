import type { ModuleItem } from '@/lib/ecosystem/types';

export const TRAINING_MODULE_IDS = [
  'students',
  'teachers',
  'classes',
  'attendance',
  'grades',
  'scheduling',
] as const;

export const LEAD_STAGE_IDS = [
  'new_lead',
  'contacted',
  'interested',
  'trial_class',
  'enrolled',
] as const;

export const RECRUITMENT_STAGE_IDS = [
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
] as const;

export function buildTrainingModules(t: (key: string) => string): ModuleItem[] {
  return TRAINING_MODULE_IDS.map((id) => ({
    id,
    title: t(`ecosystemPages.shared.trainingModules.${id}.title`),
    description: t(`ecosystemPages.shared.trainingModules.${id}.description`),
  }));
}

export function buildLeadStages(t: (key: string) => string) {
  return LEAD_STAGE_IDS.map((key) => ({
    key,
    label: t(`ecosystemPages.shared.leadStages.${key}`),
  }));
}
