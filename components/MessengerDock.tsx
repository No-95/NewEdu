'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api as messagesApi } from '@/convex-messages/convex/_generated/api';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useUserEmail } from '@/hooks/useUserSession';
import {
  MESSENGER_OPEN_EVENT,
  type OpenMessengerPayload,
} from '@/lib/messenger/events';
import {
  MessagesConvexProvider,
  useMessagesConvexConfigured,
} from '@/components/messages-convex-provider';
import { Button } from '@/components/ui/button';
import { MessengerInbox, type ConversationItem } from '@/components/messenger/MessengerInbox';
import { MessengerThread } from '@/components/messenger/MessengerThread';
import { MessengerFloatingShell } from '@/components/messenger/MessengerFloatingShell';
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

function MessengerDockOffline() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MessengerFloatingShell
      isOpen={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      openChatLabel={t('messenger.openChat')}
      closeLabel={t('messenger.close')}
    >
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <MessageCircle className="h-10 w-10 text-primary" />
        <p className="text-sm text-muted-foreground">{t('messenger.unavailable')}</p>
      </div>
    </MessengerFloatingShell>
  );
}

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
  const pendingPeerRef = useRef<SearchUserResult | null>(null);

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

  const openChatWithPeer = useCallback(
    (peer: SearchUserResult) => {
      setIsOpen(true);
      if (!userEmail) {
        pendingPeerRef.current = peer;
        return;
      }
      void startChatWithUser(peer);
    },
    [userEmail, startChatWithUser]
  );

  useEffect(() => {
    if (!userEmail || !pendingPeerRef.current) return;
    const peer = pendingPeerRef.current;
    pendingPeerRef.current = null;
    void startChatWithUser(peer);
  }, [userEmail, startChatWithUser]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('openMessenger') === '1') {
      setIsOpen(true);
      setView('inbox');

      const peerEmail = params.get('peerEmail')?.trim().toLowerCase();
      if (peerEmail) {
        openChatWithPeer({
          email: peerEmail,
          fullName: params.get('peerName') ?? undefined,
          avatarUrl: params.get('peerAvatar') ?? undefined,
        });
      }
    }
  }, [openChatWithPeer]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<OpenMessengerPayload>).detail;
      if (!detail?.email) return;
      openChatWithPeer({
        email: detail.email,
        fullName: detail.fullName,
        avatarUrl: detail.avatarUrl,
      });
    };

    window.addEventListener(MESSENGER_OPEN_EVENT, handler);
    return () => window.removeEventListener(MESSENGER_OPEN_EVENT, handler);
  }, [openChatWithPeer]);

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
    <MessengerFloatingShell
      isOpen={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      badge={userEmail ? badge : 0}
      openChatLabel={t('messenger.openChat')}
      closeLabel={t('messenger.close')}
    >
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
    </MessengerFloatingShell>
  );
}

function MessengerDockConnected() {
  return (
    <MessagesConvexProvider>
      <MessengerDockInner />
    </MessagesConvexProvider>
  );
}

export function MessengerDock() {
  const configured = useMessagesConvexConfigured();

  if (!configured) {
    return <MessengerDockOffline />;
  }

  return <MessengerDockConnected />;
}
