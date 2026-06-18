import {
  downloadTextFile,
  formatCareerProfileDocument,
  type CareerProfileExport,
} from '@/lib/utils/client-actions';

export type { CareerProfileExport };

function baseFilename(profile: CareerProfileExport) {
  return `${(profile.fullName || 'hdp-edu-profile').replace(/\s+/g, '-').toLowerCase()}`;
}

export function downloadCareerCv(profile: CareerProfileExport) {
  const content = formatCareerProfileDocument(profile, 'cv');
  downloadTextFile(`${baseFilename(profile)}-cv.txt`, content);
}

export function downloadCareerTextExport(profile: CareerProfileExport) {
  const content = formatCareerProfileDocument(profile, 'pdf-text');
  downloadTextFile(`${baseFilename(profile)}-profile.txt`, content);
}

export function canDownloadCareerExport(profile: CareerProfileExport | null | undefined): boolean {
  if (!profile) return false;
  const hasContent =
    Boolean(profile.fullName?.trim()) ||
    Boolean(profile.headline?.trim()) ||
    profile.skills.length > 0 ||
    profile.education.length > 0 ||
    profile.experience.length > 0;
  return hasContent;
}
