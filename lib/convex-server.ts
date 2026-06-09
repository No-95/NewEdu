import { ConvexHttpClient } from 'convex/browser';

let convexClient: ConvexHttpClient | null = null;

export function getConvexClient(): ConvexHttpClient {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error('Missing NEXT_PUBLIC_CONVEX_URL');
  }

  if (!convexClient) {
    convexClient = new ConvexHttpClient(convexUrl);
  }

  return convexClient;
}
