'use client';

import type { MetricStat } from '@/lib/ecosystem/types';

export function EcosystemMetricGrid({ stats }: { stats: MetricStat[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
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
