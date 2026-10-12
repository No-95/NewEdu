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

  // Delegated capture for direct-contact CTAs (phone / Zalo).
  // Any <a href="tel:..."> or Zalo link anywhere on the site fires
  // generate_lead with lead_method "phone" / "zalo". Delegation means new
  // CTAs added later are covered without touching each component.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const seen = new Map<string, number>();
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = (anchor.getAttribute('href') || '').trim();
      let method: LeadMethod | null = null;
      if (/^tel:/i.test(href)) {
        method = 'phone';
      } else if (/^zalo:|(^|\.)zalo\.me\//i.test(href) || /zalo\.me/i.test(href)) {
        method = 'zalo';
      }
      if (!method) return;

      // Collapse duplicate clicks on the same target within 1s.
      const now = Date.now();
      const last = seen.get(method + href) ?? 0;
      if (now - last < 1000) return;
      seen.set(method + href, now);

      trackGenerateLead(method, {
        link_url: href,
        link_text: (anchor.textContent || '').trim().slice(0, 100),
      });
    };

    document.addEventListener('click', onDocumentClick, true);
    return () => document.removeEventListener('click', onDocumentClick, true);
  }, []);

  return null;
}

// Helper to track funnel events
export function trackFunnelEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', eventName, params);
}

// ---------------------------------------------------------------------------
// Canonical "lead" definition for hdpedu.com (single source of truth).
//
// A LEAD is an anonymous-or-known visitor who completes a contact action that
// lets the team reach them, or opens a direct contact channel:
//   1. contact_form   — /contact-us or /contact form submitted successfully
//   2. book_order     — /books/purchase form submitted successfully
//   3. messenger_dock — guest opens the on-site messenger dock (no session)
//   4. zalo / phone   — click on a Zalo or tel: contact CTA
//
// All of them fire the GA4 recommended event `generate_lead` with a
// `lead_method` param so the lead source can be split in GA4 reports.
// Mark `generate_lead` as a Key Event (conversion) in GA4 admin.
// ---------------------------------------------------------------------------

export const LEAD_EVENT_NAME = 'generate_lead';

export type LeadMethod = 'contact_form' | 'book_order' | 'messenger_dock' | 'zalo' | 'phone';

export function trackGenerateLead(method: LeadMethod, params: Record<string, any> = {}) {
  if (typeof window === 'undefined') return;
  try {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', LEAD_EVENT_NAME, {
      lead_method: method,
      ...params,
    });
  } catch {
    // Analytics must never break a conversion flow.
  }
}

// Funnel events:
// - view_trial: user views trial lesson
// - click_buy: user clicks buy button
// - create_order: user creates order
// - pay_success: payment succeeds
// - generate_lead: user became a lead (see trackGenerateLead above)
