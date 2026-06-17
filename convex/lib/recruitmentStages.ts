import { v } from 'convex/values';

export const RECRUITMENT_STAGES = ['applied', 'screening', 'interview', 'offer', 'rejected'] as const;
export type RecruitmentStage = (typeof RECRUITMENT_STAGES)[number];

export const recruitmentStageValidator = v.union(
  v.literal('applied'),
  v.literal('screening'),
  v.literal('interview'),
  v.literal('offer'),
  v.literal('rejected')
);

export function nextRecruitmentStage(stage: RecruitmentStage): RecruitmentStage | null {
  const order: RecruitmentStage[] = ['applied', 'screening', 'interview', 'offer'];
  const index = order.indexOf(stage);
  if (index < 0 || index >= order.length - 1) return null;
  return order[index + 1];
}
