'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { useMemo, type ReactNode } from 'react';

interface MessagesConvexProviderProps {
  children: ReactNode;
}

export function MessagesConvexProvider({ children }: MessagesConvexProviderProps) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_MESSAGES_URL?.trim();

  const client = useMemo(
    () => (convexUrl ? new ConvexReactClient(convexUrl) : null),
    [convexUrl]
  );

  if (!convexUrl || !client) {
    return null;
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}

export function useMessagesConvexConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CONVEX_MESSAGES_URL?.trim());
}
