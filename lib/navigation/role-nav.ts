import type { RoleKey } from '@/lib/onboarding/schema';
import { ROLE_KEYS } from '@/lib/onboarding/schema';

export type RoleNavItem = {
  id: string;
  labelKey: string;
  href: string;
};

export type RoleNavMenuKey = 'learner' | 'teacher' | 'job_seeker' | 'employer' | 'expert';

const COMMUNITY: RoleNavItem = {
  id: 'community',
  labelKey: 'common.community',
  href: '/community',
};

const EVENTS: RoleNavItem = {
  id: 'events',
  labelKey: 'nav.role.events',
  href: '/contact-us',
};

const EVENTS_FULL: RoleNavItem = {
  id: 'events',
  labelKey: 'nav.ecosystem.events',
  href: '/contact-us',
};

export const ROLE_NAV_BY_KEY: Record<RoleNavMenuKey, RoleNavItem[]> = {
  learner: [
    { id: 'courses', labelKey: 'nav.ecosystem.learners.courses', href: '/courses' },
    { id: 'mentor', labelKey: 'nav.ecosystem.learners.mentor', href: '/dashboard' },
    { id: 'library', labelKey: 'nav.ecosystem.learners.library', href: '/books' },
    { id: 'assessments', labelKey: 'nav.role.assessments', href: '/dashboard' },
    COMMUNITY,
    EVENTS,
  ],
  teacher: [
    { id: 'training', labelKey: 'nav.ecosystem.teachers.training', href: '/teacher-center/training-management' },
    { id: 'crm', labelKey: 'nav.ecosystem.teachers.crm', href: '/teacher-center/admission-crm' },
    { id: 'business', labelKey: 'nav.ecosystem.teachers.business', href: '/teacher-center/business-development' },
    { id: 'reports', labelKey: 'nav.ecosystem.teachers.reports', href: '/teacher-center/reporting' },
    { id: 'library', labelKey: 'nav.ecosystem.teachers.library', href: '/teacher-center/resource-library' },
    COMMUNITY,
    EVENTS,
  ],
  job_seeker: [
    { id: 'profile', labelKey: 'nav.ecosystem.careers.profile', href: '/career/profile' },
    { id: 'jobs', labelKey: 'nav.ecosystem.careers.jobs', href: '/jobs' },
    { id: 'support', labelKey: 'nav.ecosystem.careers.support', href: '/career/career-support' },
    { id: 'matching', labelKey: 'nav.ecosystem.careers.matching', href: '/career/ai-matching' },
    COMMUNITY,
    EVENTS,
  ],
  employer: [
    { id: 'recruiting', labelKey: 'nav.ecosystem.business.recruiting', href: '/business/recruitment' },
    { id: 'hr', labelKey: 'nav.ecosystem.business.hr', href: '/business/hr-management' },
    { id: 'internalTraining', labelKey: 'nav.ecosystem.business.internalTraining', href: '/business/internal-training' },
    COMMUNITY,
    EVENTS,
  ],
  expert: [
    { id: 'network', labelKey: 'nav.ecosystem.experts.network', href: '/experts/network' },
    { id: 'topics', labelKey: 'nav.ecosystem.experts.topics', href: '/experts/events' },
    COMMUNITY,
    EVENTS_FULL,
  ],
};

export function resolveRoleNavKey(activeRole: string | null | undefined): RoleNavMenuKey {
  switch (activeRole) {
    case 'teacher':
    case 'training_center':
      return 'teacher';
    case 'job_seeker':
      return 'job_seeker';
    case 'employer':
      return 'employer';
    case 'expert':
      return 'expert';
    case 'learner':
    default:
      return 'learner';
  }
}

export function getRoleNavItems(activeRole: string | null | undefined): RoleNavItem[] {
  return ROLE_NAV_BY_KEY[resolveRoleNavKey(activeRole)];
}

export function isKnownRoleKey(value: string): value is RoleKey {
  return (ROLE_KEYS as readonly string[]).includes(value);
}
