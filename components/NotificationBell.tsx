'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useLanguage } from '@/lib/context/LanguageContext';
import { formatNotificationText } from '@/lib/notifications/formatNotification';
import { Bell } from 'lucide-react';

export function NotificationBell({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const data = useQuery(api.notifications.listNotificationsForUser, { email: userEmail, limit: 10 });
  const markRead = useMutation(api.notifications.markNotificationRead);
  const markAllRead = useMutation(api.notifications.markAllNotificationsRead);
  const unread = data?.unreadCount ?? 0;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        aria-label={t('notifications.title')}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-80">
          <div className="glass overflow-hidden rounded-xl border border-border/50 bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/50 px-4 py-2">
              <p className="text-sm font-semibold">{t('notifications.title')}</p>
              {unread > 0 ? (
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => void markAllRead({ email: userEmail })}
                >
                  {t('notifications.markAllRead')}
                </button>
              ) : null}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {!data ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">{t('notifications.loading')}</p>
              ) : data.items.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">{t('notifications.empty')}</p>
              ) : (
                data.items.map((item) => {
                  const text = formatNotificationText(item, t);
                  const content = (
                    <div
                      className={`border-b border-border/30 px-4 py-3 text-left transition-colors hover:bg-muted/40 ${item.read ? 'opacity-70' : ''}`}
                    >
                      <p className="text-sm font-medium text-foreground">{text.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{text.body}</p>
                    </div>
                  );
                  if (item.href) {
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => {
                          setOpen(false);
                          if (!item.read) {
                            void markRead({
                              email: userEmail,
                              notificationId: item.id as Id<'notifications'>,
                            });
                          }
                        }}
                      >
                        {content}
                      </Link>
                    );
                  }
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="block w-full text-left"
                      onClick={() => {
                        setOpen(false);
                        if (!item.read) {
                          void markRead({
                            email: userEmail,
                            notificationId: item.id as Id<'notifications'>,
                          });
                        }
                      }}
                    >
                      {content}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
