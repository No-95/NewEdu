import type { MutationCtx, QueryCtx } from '../_generated/server';
import type { Id } from '../_generated/dataModel';
import type { RecruitmentStage } from './recruitmentStages';

export async function insertStageEvent(
  ctx: MutationCtx,
  args: {
    candidateId: Id<'recruitmentCandidates'>;
    fromStage?: RecruitmentStage;
    toStage: RecruitmentStage;
    actorUserId?: Id<'users'>;
    createdAt?: number;
  }
) {
  await ctx.db.insert('recruitmentStageEvents', {
    candidateId: args.candidateId,
    fromStage: args.fromStage,
    toStage: args.toStage,
    actorUserId: args.actorUserId,
    createdAt: args.createdAt ?? Date.now(),
  });
}

export async function listStageEventsForCandidate(
  ctx: QueryCtx,
  candidateId: Id<'recruitmentCandidates'>
) {
  const events = await ctx.db
    .query('recruitmentStageEvents')
    .withIndex('by_candidateId_createdAt', (q) => q.eq('candidateId', candidateId))
    .order('asc')
    .collect();

  return events.map((event) => ({
    fromStage: event.fromStage,
    toStage: event.toStage,
    createdAt: event.createdAt,
  }));
}
