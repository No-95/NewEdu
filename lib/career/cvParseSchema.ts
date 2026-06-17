import { z } from 'zod';

export const cvDraftSchema = z.object({
  location: z.string().optional(),
  education: z.array(
    z.object({
      school: z.string(),
      degree: z.string(),
      year: z.string(),
    })
  ),
  skills: z.array(
    z.object({
      name: z.string(),
      level: z.union([z.number(), z.string()]),
    })
  ),
  certificates: z.array(
    z.object({
      name: z.string(),
      issuer: z.string(),
      year: z.string(),
    })
  ),
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      period: z.string(),
      description: z.string(),
    })
  ),
  languages: z.array(
    z.object({
      name: z.string(),
      level: z.string(),
    })
  ),
});

export type CvDraft = z.infer<typeof cvDraftSchema>;

export function normalizeSkillLevel(level: number | string): number {
  if (typeof level === 'number' && level >= 1 && level <= 5) return Math.round(level);
  const text = String(level).toLowerCase();
  if (text.includes('expert') || text.includes('advanced') || text.includes('fluent')) return 5;
  if (text.includes('intermediate') || text.includes('professional')) return 3;
  if (text.includes('beginner') || text.includes('basic')) return 2;
  const parsed = Number.parseInt(text, 10);
  if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 5) return parsed;
  return 3;
}

export function normalizeCvDraft(draft: CvDraft) {
  return {
    location: draft.location?.trim() || undefined,
    education: draft.education.filter((e) => e.school.trim()),
    skills: draft.skills
      .filter((s) => s.name.trim())
      .map((s) => ({ name: s.name.trim(), level: normalizeSkillLevel(s.level) })),
    certificates: draft.certificates.filter((c) => c.name.trim()),
    experience: draft.experience.filter((e) => e.company.trim() || e.role.trim()),
    languages: draft.languages.filter((l) => l.name.trim()),
  };
}

export function buildCvParsePrompt(cvText: string) {
  return `Extract structured career profile data from this CV/resume text.
Return ONLY valid JSON matching this shape (no markdown):
{
  "location": "city or country string or omit",
  "education": [{"school":"","degree":"","year":""}],
  "skills": [{"name":"","level":3}],
  "certificates": [{"name":"","issuer":"","year":""}],
  "experience": [{"company":"","role":"","period":"","description":""}],
  "languages": [{"name":"","level":""}]
}
Use skill level 1-5 (number). Keep arrays empty if none found.

CV TEXT:
${cvText.slice(0, 12000)}`;
}
