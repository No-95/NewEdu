import type { MetricStat } from '@/lib/ecosystem/types';

type MetricWithId = { id: string; value: string; accent?: boolean };

export function translateMetrics(
  metrics: MetricWithId[],
  t: (key: string) => string,
  prefix: string
): MetricStat[] {
  return metrics.map((metric) => ({
    label: t(`${prefix}.${metric.id}`),
    value: metric.value,
    accent: metric.accent,
  }));
}

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
