'use client';

import { Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type MessengerAiRowProps = {
  label: string;
  onClick: () => void;
};

export function MessengerAiRow({ label, onClick }: MessengerAiRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-border/40 px-4 py-3 text-left transition-colors hover:bg-muted/50"
    >
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-primary/15 text-primary">
          <Bot className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{label}</p>
        <p className="truncate text-xs text-muted-foreground">AI</p>
      </div>
    </button>
  );
}
