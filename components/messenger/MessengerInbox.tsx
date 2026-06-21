'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessengerAiRow } from './MessengerAiRow';
import { MessengerUserSearch, type SearchUserResult } from './MessengerUserSearch';

export type ConversationItem = {
  conversationId: string;
  peerEmail: string;
  peerDisplayName?: string;
  peerAvatarUrl?: string;
  lastMessageAt: number;
  lastMessagePreview: string;
  unreadCount: number;
};

type MessengerInboxProps = {
  title: string;
  aiLabel: string;
  searchPlaceholder: string;
  searchMinChars: string;
  emptyLabel: string;
  loadingLabel: string;
  conversations: ConversationItem[] | undefined;
  onOpenAi: () => void;
  onOpenConversation: (item: ConversationItem) => void;
  onSelectUser: (user: SearchUserResult) => void;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function formatTime(ts: number) {
  const date = new Date(ts);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function MessengerInbox({
  title,
  aiLabel,
  searchPlaceholder,
  searchMinChars,
  emptyLabel,
  loadingLabel,
  conversations,
  onOpenAi,
  onOpenConversation,
  onSelectUser,
}: MessengerInboxProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40 px-4 py-3">
        <p className="text-base font-semibold">{title}</p>
      </div>

      <MessengerUserSearch
        placeholder={searchPlaceholder}
        minCharsHint={searchMinChars}
        onSelect={onSelectUser}
      />

      <MessengerAiRow label={aiLabel} onClick={onOpenAi} />

      <div className="flex-1 overflow-y-auto overscroll-contain">
        {conversations === undefined ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">{loadingLabel}</p>
        ) : conversations.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          conversations.map((item) => {
            const label = item.peerDisplayName || item.peerEmail;
            return (
              <button
                key={item.conversationId}
                type="button"
                onClick={() => onOpenConversation(item)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
              >
                <Avatar className="h-10 w-10">
                  {item.peerAvatarUrl ? (
                    <AvatarImage src={item.peerAvatarUrl} alt={label} />
                  ) : null}
                  <AvatarFallback>{initials(label)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{label}</p>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {formatTime(item.lastMessageAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-muted-foreground">
                      {item.lastMessagePreview || '—'}
                    </p>
                    {item.unreadCount > 0 ? (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                        {item.unreadCount > 9 ? '9+' : item.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
