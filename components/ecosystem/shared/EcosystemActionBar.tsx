'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function EcosystemActionBar({
  actions,
}: {
  actions: {
    label: string;
    variant?: 'default' | 'outline' | 'secondary';
    onClick?: () => void;
    href?: string;
  }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        const className =
          action.variant === 'default'
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'border-white/15 bg-white/5';

        if (action.href && !action.onClick) {
          return (
            <Button key={action.label} variant={action.variant ?? 'outline'} size="sm" asChild className={className}>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          );
        }

        return (
          <Button
            key={action.label}
            variant={action.variant ?? 'outline'}
            size="sm"
            onClick={action.onClick}
            className={className}
          >
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
