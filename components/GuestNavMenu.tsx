'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GUEST_ECOSYSTEM_GROUPS,
  GUEST_ECOSYSTEM_MENU_LABEL,
  GUEST_COMMUNITY,
  GUEST_EVENTS,
  GUEST_HOME,
  type GuestNavGroup,
} from '@/lib/navigation/guest-nav';

type GuestNavMenuProps = {
  t: (key: string) => string;
  variant: 'desktop' | 'mobile';
  onNavigate?: () => void;
};

function useActivePath() {
  const pathname = usePathname();
  return (href: string) => pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));
}

function TopLink({
  href,
  label,
  active,
  onNavigate,
  className = 'rounded-lg px-3 py-2 text-sm font-medium transition-all',
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`${className} ${
        active
          ? 'text-primary bg-primary/10'
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
      }`}
    >
      {label}
    </Link>
  );
}

function EcosystemMegaMenu({
  t,
  isActivePath,
}: {
  t: (key: string) => string;
  isActivePath: (href: string) => boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuActive = GUEST_ECOSYSTEM_GROUPS.some((group) =>
    group.children.some((child) => isActivePath(child.href))
  );

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
          open || menuActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
        }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {t(GUEST_ECOSYSTEM_MENU_LABEL)}
        <svg
          className={`h-4 w-4 opacity-70 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-[min(720px,calc(100vw-2rem))] -translate-x-1/2">
          <div className="rounded-xl border border-border/50 bg-card p-5 shadow-2xl glass">
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
              {GUEST_ECOSYSTEM_GROUPS.map((group) => (
                <MegaMenuColumn key={group.id} group={group} t={t} isActivePath={isActivePath} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MegaMenuColumn({
  group,
  t,
  isActivePath,
}: {
  group: GuestNavGroup;
  t: (key: string) => string;
  isActivePath: (href: string) => boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary/90">
        {t(group.labelKey)}
      </p>
      <ul className="space-y-1">
        {group.children.map((child) => (
          <li key={child.id}>
            <Link
              href={child.href}
              className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
                isActivePath(child.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              {t(child.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MobileEcosystemSection({
  t,
  isActivePath,
  onNavigate,
}: {
  t: (key: string) => string;
  isActivePath: (href: string) => boolean;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-lg border border-border/40">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground"
      >
        {t(GUEST_ECOSYSTEM_MENU_LABEL)}
        <svg
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="space-y-4 border-t border-border/40 px-4 py-3">
          {GUEST_ECOSYSTEM_GROUPS.map((group) => (
            <div key={group.id}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-primary/90">
                {t(group.labelKey)}
              </p>
              <div className="space-y-0.5">
                {group.children.map((child) => (
                  <Link
                    key={child.id}
                    href={child.href}
                    onClick={onNavigate}
                    className={`block rounded-md px-2 py-2 text-sm ${
                      isActivePath(child.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t(child.labelKey)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function GuestNavMenu({ t, variant, onNavigate }: GuestNavMenuProps) {
  const isActivePath = useActivePath();

  if (variant === 'desktop') {
    return (
      <nav className="hidden items-center gap-1 md:flex">
        <TopLink
          href={GUEST_HOME.href}
          label={t(GUEST_HOME.labelKey)}
          active={isActivePath(GUEST_HOME.href)}
        />
        <EcosystemMegaMenu t={t} isActivePath={isActivePath} />
        <TopLink
          href={GUEST_COMMUNITY.href}
          label={t(GUEST_COMMUNITY.labelKey)}
          active={isActivePath(GUEST_COMMUNITY.href)}
        />
        <TopLink
          href={GUEST_EVENTS.href}
          label={t(GUEST_EVENTS.labelKey)}
          active={isActivePath(GUEST_EVENTS.href)}
        />
      </nav>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <TopLink
        href={GUEST_HOME.href}
        label={t(GUEST_HOME.labelKey)}
        active={isActivePath(GUEST_HOME.href)}
        onNavigate={onNavigate}
        className="rounded-lg px-4 py-3 text-sm font-medium transition-all text-left"
      />
      <MobileEcosystemSection t={t} isActivePath={isActivePath} onNavigate={onNavigate} />
      <TopLink
        href={GUEST_COMMUNITY.href}
        label={t(GUEST_COMMUNITY.labelKey)}
        active={isActivePath(GUEST_COMMUNITY.href)}
        onNavigate={onNavigate}
        className="rounded-lg px-4 py-3 text-sm font-medium transition-all text-left"
      />
      <TopLink
        href={GUEST_EVENTS.href}
        label={t(GUEST_EVENTS.labelKey)}
        active={isActivePath(GUEST_EVENTS.href)}
        onNavigate={onNavigate}
        className="rounded-lg px-4 py-3 text-sm font-medium transition-all text-left"
      />
    </div>
  );
}
