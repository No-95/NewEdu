'use client';

import { ReactNode, useState, type WheelEvent } from 'react';
import { Bot, MessageCircle, Send, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type ChatMessage = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
};

interface AISupportDockProps {
  children: ReactNode;
}

const BULLET_LINE_REGEX = /^\s*[-+]\s+(.+)$/;

export function AISupportDock({ children }: AISupportDockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [apiError, setApiError] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'assistant',
      text: 'Hi! I am your AI support assistant. Ask me anything about HDP EDU.',
    },
  ]);

  const renderAssistantMessage = (content: string) => {
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
  };

  const handleMessagesWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.stopPropagation();

    const container = event.currentTarget;
    if (container.scrollHeight <= container.clientHeight) {
      event.preventDefault();
      return;
    }

    const atTop = container.scrollTop <= 0;
    const atBottom =
      container.scrollTop + container.clientHeight >= container.scrollHeight - 1;

    // Prevent wheel chaining to page scroll when reaching chat boundaries.
    if ((event.deltaY < 0 && atTop) || (event.deltaY > 0 && atBottom)) {
      event.preventDefault();
    }
  };

  const sendMessage = async () => {
    const message = text.trim();
    if (!message || isSending) return;

    setApiError('');

    const nextMessages = [...messages, { id: Date.now(), role: 'user' as const, text: message }];
    setMessages(nextMessages);
    setText('');

    try {
      setIsSending(true);
      const response = await fetch('/api/support/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history: nextMessages.slice(-6).map((item) => ({
            role: item.role,
            text: item.text,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.reply) {
        setApiError(
          data?.detail || data?.error || 'AI service is temporarily unavailable. Please try again.'
        );
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'assistant',
            text: 'Sorry, I cannot respond right now. Please contact support directly.',
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: data.reply,
        },
      ]);
    } catch {
      setApiError('Cannot connect to AI service.');
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: 'Connection error. Please try again later.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      <div
        className={[
          'relative z-10 min-h-screen overflow-x-hidden transition-all duration-500 ease-out',
          isOpen ? 'w-[75%]' : 'w-full',
        ].join(' ')}
      >
        {children}
      </div>

      <aside
        className={[
          'fixed right-0 top-0 z-[70] h-screen w-[25%] border-l border-border/60 bg-card/95 backdrop-blur-md transition-transform duration-500 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold">AI Support</p>
            </div>
            <Button size="icon-sm" variant="ghost" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div
            className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3"
            onWheel={handleMessagesWheel}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={[
                  'max-w-[90%] rounded-lg px-3 py-2 text-sm',
                  message.role === 'user'
                    ? 'ml-auto bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground',
                ].join(' ')}
              >
                {message.role === 'assistant' ? (
                  renderAssistantMessage(message.text)
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-border/60 p-3">
            <div className="flex items-end gap-2">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message..."
                disabled={isSending}
                rows={2}
                className="max-h-36 min-h-16 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
              />
              <Button size="icon" onClick={() => void sendMessage()} disabled={isSending}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {apiError ? <p className="mt-2 text-xs text-red-400">{apiError}</p> : null}
            {isSending ? <p className="mt-2 text-xs text-muted-foreground">AI is typing...</p> : null}
          </div>
        </div>
      </aside>

      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[80] inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_30px_rgba(0,217,255,0.45)] transition-transform hover:scale-105"
          aria-label="Open AI support chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      ) : null}
    </div>
  );
}
