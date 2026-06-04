'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { useMemo, type ReactNode } from 'react';

interface AppConvexProviderProps {
  children: ReactNode;
}

export function AppConvexProvider({ children }: AppConvexProviderProps) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();

  const client = useMemo(
    () => (convexUrl ? new ConvexReactClient(convexUrl) : null),
    [convexUrl]
  );

  if (!convexUrl || !client) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-center">
          <h1 className="text-lg font-bold text-foreground">Configuration error</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            <code className="text-xs">NEXT_PUBLIC_CONVEX_URL</code> is missing from the production
            build. Rebuild with <code className="text-xs">.env.production</code> and redeploy using{' '}
            <code className="text-xs">pnpm run deploy:prod</code>.
          </p>
        </div>
      </div>
    );
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
