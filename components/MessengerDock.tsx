'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, X } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api as messagesApi } from '@/convex-messages/convex/_generated/api';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useUserEmail } from '@/hooks/useUserSession';
import { MessagesConvexProvider } from '@/components/messages-convex-provider';
import { Button } from '@/components/ui/button';
import { MessengerInbox, type ConversationItem } from '@/components/messenger/MessengerInbox';
import { MessengerThread } from '@/components/messenger/MessengerThread';
import type { SearchUserResult } from '@/components/messenger/MessengerUserSearch';

type View = 'inbox' | 'ai' | 'user';

type ActiveUserThread = {
  conversationId: string;
  peer: {
    email: string;
    displayName: string;
    avatarUrl?: string;
  };
};

function MessengerDockInner() {
  const { language, t } = useLanguage();
  const userEmail = useUserEmail();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>('inbox');
  const [activeThread, setActiveThread] = useState<ActiveUserThread | null>(null);
  const [profileReady, setProfileReady] = useState(false);
  const [displayName, setDisplayName] = useState<string | undefined>();

  const ensureProfile = useMutation(messagesApi.profiles.ensureProfile);
  const getOrCreateConversation = useMutation(messagesApi.conversations.getOrCreateConversation);

  const conversations = useQuery(
    messagesApi.conversations.listConversations,
    userEmail && isOpen ? { email: userEmail } : 'skip'
  );

  const unreadCount = useQuery(
    messagesApi.messages.getTotalUnreadCount,
    userEmail ? { email: userEmail } : 'skip'
  );

  useEffect(() => {
    if (!userEmail || profileReady) return;

    void fetch('/api/auth/me', { credentials: 'same-origin', cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const name = data?.fullName || data?.email?.split('@')[0];
        setDisplayName(name);
        return ensureProfile({
          email: userEmail,
          displayName: name,
          mainUserId: data?.id,
        });
      })
      .then(() => setProfileReady(true))
      .catch(() => setProfileReady(true));
  }, [userEmail, profileReady, ensureProfile]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('openMessenger') === '1') {
      setIsOpen(true);
      setView('inbox');
    }
  }, []);

  const openConversation = useCallback((item: ConversationItem) => {
    setActiveThread({
      conversationId: item.conversationId,
      peer: {
        email: item.peerEmail,
        displayName: item.peerDisplayName || item.peerEmail,
        avatarUrl: item.peerAvatarUrl,
      },
    });
    setView('user');
  }, []);

  const startChatWithUser = useCallback(
    async (user: SearchUserResult) => {
      if (!userEmail) return;
      const { conversationId } = await getOrCreateConversation({
        email: userEmail,
        otherEmail: user.email,
      });
      await ensureProfile({
        email: user.email,
        displayName: user.fullName,
        avatarUrl: user.avatarUrl,
      });
      setActiveThread({
        conversationId,
        peer: {
          email: user.email,
          displayName: user.fullName || user.email,
          avatarUrl: user.avatarUrl,
        },
      });
      setView('user');
    },
    [userEmail, getOrCreateConversation, ensureProfile]
  );

  const threadLabels = {
    back: t('messenger.back'),
    placeholder: t('messenger.placeholder'),
    aiTyping: t('messenger.aiTyping'),
    aiWelcome: t('messenger.aiWelcome'),
    aiLabel: t('messenger.aiLabel'),
    aiErrorUnavailable: t('messenger.aiErrorUnavailable'),
    aiErrorConnection: t('messenger.aiErrorConnection'),
    aiFallbackSorry: t('messenger.aiFallbackSorry'),
    aiFallbackConnection: t('messenger.aiFallbackConnection'),
  };

  const badge = unreadCount ?? 0;

  return (
    <>
      {isOpen ? (
        <div className="fixed bottom-6 right-6 z-[80] flex h-[min(480px,calc(100vh-3rem))] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-end border-b border-border/40 px-2 py-1">
            <Button size="icon-sm" variant="ghost" onClick={() => setIsOpen(false)} aria-label={t('messenger.close')}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="min-h-0 flex-1">
            {!userEmail ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                <MessageCircle className="h-10 w-10 text-primary" />
                <p className="text-sm text-muted-foreground">{t('messenger.loginPrompt')}</p>
                <Button asChild size="sm">
                  <Link href="/auth">{t('messenger.loginCta')}</Link>
                </Button>
              </div>
            ) : view === 'inbox' ? (
              <MessengerInbox
                title={t('messenger.title')}
                aiLabel={t('messenger.aiLabel')}
                searchPlaceholder={t('messenger.searchPlaceholder')}
                searchMinChars={t('messenger.searchMinChars')}
                emptyLabel={t('messenger.emptyConversations')}
                loadingLabel={t('messenger.loadingConversations')}
                conversations={conversations}
                onOpenAi={() => setView('ai')}
                onOpenConversation={openConversation}
                onSelectUser={(user) => void startChatWithUser(user)}
              />
            ) : view === 'ai' ? (
              <MessengerThread
                mode="ai"
                userEmail={userEmail}
                language={language}
                labels={threadLabels}
                onBack={() => setView('inbox')}
              />
            ) : activeThread ? (
              <MessengerThread
                mode="user"
                userEmail={userEmail}
                senderDisplayName={displayName}
                conversationId={activeThread.conversationId}
                peer={activeThread.peer}
                language={language}
                labels={threadLabels}
                onBack={() => {
                  setView('inbox');
                  setActiveThread(null);
                }}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[80] relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_30px_rgba(0,217,255,0.45)] transition-transform hover:scale-105"
          aria-label={t('messenger.openChat')}
        >
          <MessageCircle className="h-6 w-6" />
          {userEmail && badge > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {badge > 9 ? '9+' : badge}
            </span>
          ) : null}
        </button>
      ) : null}
    </>
  );
}

export function MessengerDock() {
  return (
    <MessagesConvexProvider>
      <MessengerDockInner />
    </MessagesConvexProvider>
  );
}
