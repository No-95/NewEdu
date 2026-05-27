'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { useMemo, type ReactNode } from 'react';

interface AppConvexProviderProps {
  children: ReactNode;
}

export function AppConvexProvider({ children }: AppConvexProviderProps) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    throw new Error('NEXT_PUBLIC_CONVEX_URL is missing.');
  }

  const client = useMemo(() => new ConvexReactClient(convexUrl), [convexUrl]);

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
