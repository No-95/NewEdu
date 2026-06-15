'use client';

import { Button } from '@/components/ui/button';

export function EcosystemActionBar({
  actions,
}: {
  actions: { label: string; variant?: 'default' | 'outline' | 'secondary'; onClick?: () => void }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={action.variant ?? 'outline'}
          size="sm"
          onClick={action.onClick}
          className={action.variant === 'default' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border-white/15 bg-white/5'}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
