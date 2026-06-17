import type { Doc } from '../_generated/dataModel';

const COMMON_SKILLS = ['korean', 'english', 'excel', 'communication', 'manufacturing'] as const;

export function computeSkillGaps(
  profileSkills: { name: string }[] | undefined,
  openJobs: Pick<Doc<'recruitmentJobPostings'>, 'title' | 'description'>[]
): string[] {
  const skillNames = (profileSkills ?? [])
    .map((s) => s.name.trim().toLowerCase())
    .filter(Boolean);

  const gaps: string[] = [];
  for (const skill of COMMON_SKILLS) {
    const has = skillNames.some((s) => s.includes(skill));
    const inDemand = openJobs.some((job) =>
      `${job.title} ${job.description ?? ''}`.toLowerCase().includes(skill)
    );
    if (inDemand && !has) gaps.push(skill);
  }
  return gaps;
}
