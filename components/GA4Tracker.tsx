'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || 'G-E5DZZJLMBX';

export function GA4Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA4_ID || typeof window === 'undefined') return;

    // Track page view on route change
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    window.gtag?.('event', 'page_view', {
      page_path: url,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}

// Helper to track funnel events
export function trackFunnelEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', eventName, params);
}

// Funnel events:
// - view_trial: user views trial lesson
// - click_buy: user clicks buy button
// - create_order: user creates order
// - pay_success: payment succeeds
