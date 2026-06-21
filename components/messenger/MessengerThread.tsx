'use client';

import { useEffect, useRef, useState, type WheelEvent } from 'react';
import { ArrowLeft, Bot, Send } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api as messagesApi } from '@/convex-messages/_generated/api';
import type { Id } from '@/convex-messages/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessengerBubble } from './MessengerBubble';

type AiMessage = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
};

type ThreadPeer = {
  email: string;
  displayName: string;
  avatarUrl?: string;
};

type MessengerThreadProps = {
  mode: 'ai' | 'user';
  userEmail: string;
  senderDisplayName?: string;
  conversationId?: string;
  peer?: ThreadPeer;
  language: 'en' | 'vi' | 'ko';
  labels: {
    back: string;
    placeholder: string;
    aiTyping: string;
    aiWelcome: string;
    aiLabel: string;
    aiErrorUnavailable: string;
    aiErrorConnection: string;
    aiFallbackSorry: string;
    aiFallbackConnection: string;
  };
  onBack: () => void;
};

const BULLET_LINE_REGEX = /^\s*[-+]\s+(.+)$/;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function renderAssistantMessage(content: string) {
  const blocks: Array<{ type: 'paragraph'; text: string } | { type: 'list'; items: string[] }> = [];
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    blocks.push({ type: 'paragraph', text: paragraphLines.join('\n') });
    paragraphLines = [];
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push({ type: 'list', items: listItems });
    listItems = [];
  };

  for (const line of lines) {
    const bulletMatch = line.match(BULLET_LINE_REGEX);
    if (bulletMatch) {
      flushParagraph();
      listItems.push(bulletMatch[1].trim());
      continue;
    }
    if (line.trim() === '') {
      flushParagraph();
      flushList();
      continue;
    }
    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();

  return (
    <div className="space-y-2">
      {blocks.map((block, index) =>
        block.type === 'list' ? (
          <ul key={`list-${index}`} className="list-disc space-y-1 pl-5 leading-relaxed">
            {block.items.map((item, itemIndex) => (
              <li key={`list-item-${index}-${itemIndex}`}>{item}</li>
            ))}
          </ul>
        ) : (
          <p key={`paragraph-${index}`} className="whitespace-pre-wrap leading-relaxed">
            {block.text}
          </p>
        )
      )}
    </div>
  );
}

export function MessengerThread({
  mode,
  userEmail,
  senderDisplayName,
  conversationId,
  peer,
  language,
  labels,
  onBack,
}: MessengerThreadProps) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [apiError, setApiError] = useState('');
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendUserMessage = useMutation(messagesApi.messages.sendMessage);
  const markRead = useMutation(messagesApi.messages.markConversationRead);

  const dmMessages = useQuery(
    messagesApi.messages.listMessages,
    mode === 'user' && conversationId
      ? {
          email: userEmail,
          conversationId: conversationId as Id<'conversations'>,
        }
      : 'skip'
  );

  useEffect(() => {
    if (mode !== 'ai') return;
    const welcome = labels.aiWelcome;
    setAiMessages((prev) => {
      if (prev.length === 0) return [{ id: 1, role: 'assistant', text: welcome }];
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [{ ...prev[0], text: welcome }];
      }
      return prev;
    });
  }, [mode, labels.aiWelcome, language]);

  useEffect(() => {
    if (mode !== 'user' || !conversationId) return;
    void markRead({
      email: userEmail,
      conversationId: conversationId as Id<'conversations'>,
    });
  }, [mode, conversationId, userEmail, markRead, dmMessages?.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [aiMessages, dmMessages, isSending]);

  const handleMessagesWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const container = event.currentTarget;
    if (container.scrollHeight <= container.clientHeight) {
      event.preventDefault();
      return;
    }
    const atTop = container.scrollTop <= 0;
    const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 1;
    if ((event.deltaY < 0 && atTop) || (event.deltaY > 0 && atBottom)) {
      event.preventDefault();
    }
  };

  const sendAiMessage = async () => {
    const message = text.trim();
    if (!message || isSending) return;

    setApiError('');
    const nextMessages = [...aiMessages, { id: Date.now(), role: 'user' as const, text: message }];
    setAiMessages(nextMessages);
    setText('');

    try {
      setIsSending(true);
      const response = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          locale: language,
          history: nextMessages.slice(-6).map((item) => ({
            role: item.role,
            text: item.text,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.reply) {
        setApiError(data?.detail || data?.error || labels.aiErrorUnavailable);
        setAiMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: 'assistant', text: labels.aiFallbackSorry },
        ]);
        return;
      }

      setAiMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', text: data.reply },
      ]);
    } catch {
      setApiError(labels.aiErrorConnection);
      setAiMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', text: labels.aiFallbackConnection },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const sendDmMessage = async () => {
    const message = text.trim();
    if (!message || isSending || !conversationId) return;

    setApiError('');
    setText('');

    try {
      setIsSending(true);
      await sendUserMessage({
        email: userEmail,
        conversationId: conversationId as Id<'conversations'>,
        body: message,
        senderDisplayName,
      });
    } catch (error) {
      setApiError(error instanceof Error ? error.message : labels.aiErrorConnection);
      setText(message);
    } finally {
      setIsSending(false);
    }
  };

  const sendMessage = () => {
    if (mode === 'ai') void sendAiMessage();
    else void sendDmMessage();
  };

  const headerTitle = mode === 'ai' ? labels.aiLabel : peer?.displayName || peer?.email || '';
  const headerSubtitle = mode === 'ai' ? 'AI' : peer?.email;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border/40 px-3 py-2">
        <Button size="icon-sm" variant="ghost" onClick={onBack} aria-label={labels.back}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        {mode === 'ai' ? (
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/15 text-primary">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="h-9 w-9">
            {peer?.avatarUrl ? <AvatarImage src={peer.avatarUrl} alt={headerTitle} /> : null}
            <AvatarFallback>{initials(headerTitle)}</AvatarFallback>
          </Avatar>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{headerTitle}</p>
          {mode === 'user' ? (
            <p className="truncate text-xs text-muted-foreground">{headerSubtitle}</p>
          ) : null}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-2 overflow-y-auto overscroll-contain px-3 py-3"
        onWheel={handleMessagesWheel}
      >
        {mode === 'ai'
          ? aiMessages.map((message) => (
              <MessengerBubble
                key={message.id}
                text={message.text}
                isOwn={message.role === 'user'}
                rich={message.role === 'assistant'}
              >
                {renderAssistantMessage(message.text)}
              </MessengerBubble>
            ))
          : dmMessages?.map((message) => (
              <MessengerBubble key={message.id} text={message.body} isOwn={message.isOwn} />
            ))}
      </div>

      <div className="border-t border-border/40 p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={labels.placeholder}
            disabled={isSending}
            rows={2}
            className="max-h-28 min-h-14 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button size="icon" onClick={sendMessage} disabled={isSending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {apiError ? <p className="mt-2 text-xs text-red-400">{apiError}</p> : null}
        {isSending && mode === 'ai' ? (
          <p className="mt-2 text-xs text-muted-foreground">{labels.aiTyping}</p>
        ) : null}
      </div>
    </div>
  );
}
