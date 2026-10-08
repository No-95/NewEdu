import type { Metadata } from 'next';
import { getConvexClient } from '@/lib/convex-server';

const SITE_URL = 'https://hdpedu.com';

/** Trim text to a safe meta length without cutting a word in half. */
export function clampText(text: string | undefined, max: number): string {
  const clean = (text ?? '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

export type SeoInput = {
  title: string;
  description: string;
  /** Path relative to the site root, e.g. `/jobs/abc`. */
  path: string;
  index?: boolean;
};

/** Build a Next.js Metadata object with canonical + robots for one route. */
export function buildMetadata({ title, description, path, index = true }: SeoInput): Metadata {
  return {
    title: clampText(title, 60),
    description: clampText(description, 158),
    alternates: { canonical: `${SITE_URL}${path}` },
    robots: { index, follow: index },
  };
}

/**
 * Run a Convex query for SEO metadata. Never throws: a missing URL or a
 * transient Convex error falls back to `null` so the page still renders with
 * its static parent metadata.
 */
export async function seoQuery<T>(
  run: (client: ReturnType<typeof getConvexClient>) => Promise<T>,
): Promise<T | null> {
  try {
    return await run(getConvexClient());
  } catch {
    return null;
  }
}
