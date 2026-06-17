import type { Doc } from '../_generated/dataModel';

export function computeCareerCompletionScoreFromProfile(
  user: Pick<Doc<'users'>, 'fullName' | 'phone'> | null,
  profile: Doc<'careerProfiles'> | null,
  headline: string | null | undefined
) {
  let score = 0;
  if (user?.fullName?.trim()) score += 15;
  if (user?.phone?.trim()) score += 10;
  if (headline?.trim()) score += 15;
  if (profile?.location?.trim()) score += 10;
  if (profile?.education?.length) score += 15;
  if (profile?.skills?.length) score += 15;
  if (profile?.experience?.length) score += 10;
  if (profile?.certificates?.length) score += 5;
  if (profile?.languages?.length) score += 5;
  return Math.min(100, score);
}

export function computeCareerCompletionScoreFromProfileOnly(profile: {
  location?: string;
  education: { school: string }[];
  skills: { name: string }[];
  experience: { company: string }[];
  languages: { name: string }[];
}) {
  let score = 0;
  if (profile.location?.trim()) score += 15;
  if (profile.education.length > 0) score += 20;
  if (profile.skills.length >= 3) score += 25;
  else if (profile.skills.length > 0) score += 10;
  if (profile.experience.length > 0) score += 25;
  if (profile.languages.length > 0) score += 15;
  return Math.min(100, score);
}
