export type GuestNavChild = {
  id: string;
  labelKey: string;
  href: string;
};

export type GuestNavGroup = {
  id: string;
  labelKey: string;
  children: GuestNavChild[];
};

export const GUEST_HOME = {
  id: 'home',
  labelKey: 'nav.ecosystem.home',
  href: '/',
} as const;

export const GUEST_EVENTS = {
  id: 'events',
  labelKey: 'nav.ecosystem.events',
  href: '/contact-us',
} as const;

export const GUEST_COMMUNITY = {
  id: 'community',
  labelKey: 'common.community',
  href: '/community',
} as const;

export const GUEST_ECOSYSTEM_MENU_LABEL = 'nav.ecosystem.menuLabel';

export const GUEST_ECOSYSTEM_GROUPS: GuestNavGroup[] = [
  {
    id: 'learners',
    labelKey: 'nav.ecosystem.learners.label',
    children: [
      { id: 'courses', labelKey: 'nav.ecosystem.learners.courses', href: '/courses' },
      { id: 'mentor', labelKey: 'nav.ecosystem.learners.mentor', href: '/auth' },
      { id: 'library', labelKey: 'nav.ecosystem.learners.library', href: '/books' },
    ],
  },
  {
    id: 'teachers',
    labelKey: 'nav.ecosystem.teachers.label',
    children: [
      { id: 'training', labelKey: 'nav.ecosystem.teachers.training', href: '/auth' },
      { id: 'crm', labelKey: 'nav.ecosystem.teachers.crm', href: '/auth' },
      { id: 'business', labelKey: 'nav.ecosystem.teachers.business', href: '/auth' },
      { id: 'reports', labelKey: 'nav.ecosystem.teachers.reports', href: '/auth' },
      { id: 'library', labelKey: 'nav.ecosystem.teachers.library', href: '/books' },
    ],
  },
  {
    id: 'careers',
    labelKey: 'nav.ecosystem.careers.label',
    children: [
      { id: 'profile', labelKey: 'nav.ecosystem.careers.profile', href: '/auth' },
      { id: 'jobs', labelKey: 'nav.ecosystem.careers.jobs', href: '/jobs' },
      { id: 'support', labelKey: 'nav.ecosystem.careers.support', href: '/auth' },
      { id: 'matching', labelKey: 'nav.ecosystem.careers.matching', href: '/auth' },
    ],
  },
  {
    id: 'business',
    labelKey: 'nav.ecosystem.business.label',
    children: [
      { id: 'recruiting', labelKey: 'nav.ecosystem.business.recruiting', href: '/jobs' },
      { id: 'hr', labelKey: 'nav.ecosystem.business.hr', href: '/auth' },
      { id: 'internalTraining', labelKey: 'nav.ecosystem.business.internalTraining', href: '/auth' },
    ],
  },
  {
    id: 'experts',
    labelKey: 'nav.ecosystem.experts.label',
    children: [
      { id: 'network', labelKey: 'nav.ecosystem.experts.network', href: '/auth' },
      { id: 'topics', labelKey: 'nav.ecosystem.experts.topics', href: '/auth' },
    ],
  },
];
