'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSiteModeCssVariables, useSiteMode } from '@/components/site-mode-provider';

const DOCK_POSITION =
  'fixed z-[100] bottom-6 right-6 left-auto max-md:bottom-4 max-md:right-4 max-md:left-auto';

type MessengerFloatingShellProps = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  badge?: number;
  openChatLabel: string;
  closeLabel: string;
  children: ReactNode;
};

export function MessengerFloatingShell({
  isOpen,
  onOpen,
  onClose,
  badge = 0,
  openChatLabel,
  closeLabel,
  children,
}: MessengerFloatingShellProps) {
  const [mounted, setMounted] = useState(false);
  const { mode } = useSiteMode();

  const themeStyle = useMemo(
    () => getSiteModeCssVariables(mode) as CSSProperties,
    [mode]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const dock = (
    <div
      className={`site-mode-${mode} text-foreground`}
      data-site-mode={mode}
      style={themeStyle}
    >
      {isOpen ? (
        <div
          className={`${DOCK_POSITION} flex h-[min(480px,calc(100dvh-2rem))] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/95 text-card-foreground shadow-2xl backdrop-blur-md`}
        >
          <div className="flex items-center justify-end border-b border-border/40 px-2 py-1">
            <Button size="icon-sm" variant="ghost" onClick={onClose} aria-label={closeLabel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="min-h-0 flex-1">{children}</div>
        </div>
      ) : (
        <div className={DOCK_POSITION}>
          <button
            type="button"
            onClick={onOpen}
            className="messenger-fab relative inline-flex h-14 w-14 items-center justify-center rounded-full border border-primary/25 transition-transform hover:scale-105"
            aria-label={openChatLabel}
          >
            <MessageCircle className="h-6 w-6" />
            {badge > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                {badge > 9 ? '9+' : badge}
              </span>
            ) : null}
          </button>
        </div>
      )}
    </div>
  );

  if (!mounted) return null;
  return createPortal(dock, document.body);
}
