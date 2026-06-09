'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/context/LanguageContext';
import { getRoleLabelKey } from '@/lib/dashboard/role-utils';

type RoleSwitcherProps = {
  activeRole: string;
  roles: string[];
  onRoleChange?: (roleKey: string) => void;
};

export function RoleSwitcher({ activeRole, roles, onRoleChange }: RoleSwitcherProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const availableRoles = roles.filter((role, index) => roles.indexOf(role) === index);

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

  if (availableRoles.length <= 1) {
    return null;
  }

  const handleSwitch = async (roleKey: string) => {
    if (roleKey === activeRole || switching) return;

    setSwitching(true);
    setOpen(false);

    try {
      const response = await fetch('/api/onboarding/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleKey }),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error ?? 'Failed to switch role');
      }

      onRoleChange?.(body.activeRole);
      window.dispatchEvent(
        new CustomEvent('hdp-active-role-changed', { detail: { activeRole: body.activeRole } })
      );
      router.refresh();
    } catch {
      // keep current role on failure
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={switching}
        className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-all hover:border-primary/55 hover:bg-primary/15 disabled:opacity-60"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
        {switching ? '...' : t('dashboard.switchRole')}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[220px] overflow-hidden rounded-xl border border-border/50 bg-card shadow-2xl glass">
          <p className="border-b border-white/8 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t('dashboard.currentRole')}
          </p>
          {availableRoles.map((roleKey) => {
            const isActive = roleKey === activeRole;
            return (
              <button
                key={roleKey}
                type="button"
                onClick={() => handleSwitch(roleKey)}
                className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <span>{t(getRoleLabelKey(roleKey))}</span>
                {isActive && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">●</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
