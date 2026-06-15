'use client';

import React from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { GiftBookPreviewCard } from '@/components/books/GiftBookPreviewCard';

type GiftBookHoverBadgeProps = {
  children: React.ReactElement;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
};

export function GiftBookHoverBadge({
  children,
  side = 'top',
  align = 'center',
}: GiftBookHoverBadgeProps) {
  return (
    <HoverCard openDelay={180} closeDelay={120}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        side={side}
        align={align}
        sideOffset={8}
        className="w-[min(20rem,calc(100vw-2rem))] border-amber-300/25 bg-card/95 p-0 shadow-xl shadow-amber-950/20 backdrop-blur-md"
      >
        <GiftBookPreviewCard />
      </HoverCardContent>
    </HoverCard>
  );
}
