'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useLanguage } from '@/lib/context/LanguageContext';

export function DashboardGrid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`grid gap-5 lg:grid-cols-2 xl:gap-6 ${className}`}>{children}</div>
  );
}

export function DashboardSection({
  title,
  action,
  actionHref,
  children,
  className = '',
  delay = 0,
  span = 1,
}: {
  title: string;
  action?: string;
  actionHref?: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  span?: 1 | 2;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`home-card group ${span === 2 ? 'lg:col-span-2' : ''} ${className}`}
    >
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-white/8 pb-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">{title}</h2>
        {action && actionHref && (
          <Link
            href={actionHref}
            className="shrink-0 text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:text-primary/80"
          >
            {action} →
          </Link>
        )}
      </div>
      {children}
    </motion.section>
  );
}

export function DashboardBulletList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <DashboardEmptyState />;
  }

  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_rgba(0,217,255,0.6)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function DashboardLinkList({ items }: { items: { label: string; href: string }[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground transition-colors hover:text-primary"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_rgba(0,217,255,0.6)]" />
            <span>{item.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function DashboardEmptyState({ message }: { message?: string }) {
  const { t } = useLanguage();
  return (
    <p className="rounded-lg border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-muted-foreground">
      {message ?? t('dashboard.empty')}
    </p>
  );
}

export function DashboardLoadingState() {
  const { t } = useLanguage();
  return (
    <div className="home-panel flex min-h-[320px] items-center justify-center">
      <p className="text-sm text-muted-foreground">{t('dashboard.loadingData')}</p>
    </div>
  );
}

export function DashboardChipList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <DashboardEmptyState />;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function DashboardStatGrid({
  stats,
}: {
  stats: { label: string; value: string; accent?: boolean }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`home-card-stat text-left ${stat.accent ? 'border-primary/30 bg-primary/5' : ''}`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {stat.label}
          </p>
          <p className="mt-2 text-xl font-bold tabular-nums text-foreground md:text-2xl">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

export function DashboardKeyValueList({
  rows,
}: {
  rows: { label: string; value: string }[];
}) {
  return (
    <dl className="space-y-3">
      {rows.map((row) => (
        <div key={row.label} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/6 pb-3 last:border-0 last:pb-0">
          <dt className="text-sm text-muted-foreground">{row.label}</dt>
          <dd className="text-sm font-semibold text-foreground">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DashboardProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums text-primary">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/8">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary"
        />
      </div>
    </div>
  );
}

export function DashboardActionRow({
  actions,
}: {
  actions: { label: string; href?: string; onClick?: () => void; primary?: boolean }[];
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => {
        const className = action.primary ? 'home-btn-primary px-5 py-2.5 text-sm' : 'home-btn-outline px-5 py-2.5 text-sm';

        if (action.onClick) {
          return (
            <button key={action.label} type="button" onClick={action.onClick} className={className}>
              {action.label}
            </button>
          );
        }

        return (
          <Link key={action.label} href={action.href ?? '/dashboard'} className={className}>
            {action.label}
          </Link>
        );
      })}
    </div>
  );
}

export function DashboardIncomeRow({
  rows,
}: {
  rows: { label: string; value: string }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {rows.map((row) => (
        <div key={row.label} className="home-card-muted">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{row.label}</p>
          <p className="mt-2 font-mono text-lg font-bold text-primary">{row.value}</p>
        </div>
      ))}
    </div>
  );
}
