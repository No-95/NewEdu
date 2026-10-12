#!/usr/bin/env python3
"""Verify every hdpedu.com lead point fires the GA4 event `generate_lead`.

This is the acceptance check for HDP-14 ("Gan event lead (generate_lead) tren
hdpedu.com"). It drives a real Chromium through each lead conversion point and
asserts the event actually reaches Google Analytics, not merely that the code
calls gtag().

Two independent proofs are produced for each point:
  A) window.dataLayer contains an `event: generate_lead` entry.
  B) The real POST body sent to https://www.google-analytics.com/g/collect
     contains a segment with `en=generate_lead`.

Proof (B) is the strong one, and it has two traps worth knowing:

  1. GA batches events and only flushes on its own timer or on pagehide. You
     must wait out the batch interval and then navigate away to force the
     beacon. Without that flush the wire capture is empty even when the event
     is queued correctly -- do not read "no POST" as "event missing".
  2. Events queued on the SAME page are not guaranteed to all survive one
     flush. Each scenario therefore runs on a fresh page and is flushed on its
     own, so a passing run proves every point rather than the last one to be
     batched.

Usage:
    BASE=https://hdpedu.com python3 scripts/verify-generate-lead.py

    # against a local dev server of the change:
    pnpm exec next dev -p 3999 &
    BASE=http://127.0.0.1:3999 python3 scripts/verify-generate-lead.py

Requirements: playwright + a Chromium build. Not a package.json dependency --
run it from a venv that has playwright (e.g. ~/scrapling-venv) or with
`npx playwright`. Override the browser with CHROME_PATH if needed.

Caveat: against production this only proves the shipped bundle emits the
event. Confirming the event lands in the GA4 property itself still needs
GA4 DebugView (real-time) or the GA4 Data API (after ~24h).
"""

import json
import os
import urllib.parse

from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE", "http://127.0.0.1:3999").rstrip("/")
EXE = os.environ.get(
    "CHROME_PATH", "/home/n00bie/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome"
)

DL_QUERY = (
    "()=>JSON.parse(JSON.stringify(window.dataLayer||[]))"
    ".filter(e=>e[1]==='generate_lead').map(e=>e[2])"
)

# (scenario name, expected lead_method, driver)
SCENARIOS = [
    ("/contact-us form submit success", "contact_form"),
    ("/contact form submit success", "contact_form"),
    ("/books/purchase form submit success", "book_order"),
    ("tel: link click", "phone"),
    ("zalo.me link click", "zalo"),
    ("messenger dock open (guest)", "messenger_dock"),
]


def wire_lead_methods(posts):
    """GA sends one POST body with its events separated by CRLF."""
    found = []
    for body in posts:
        for segment in body.replace("\r\n", "\n").split("\n"):
            if not segment.strip():
                continue
            params = dict(p.split("=", 1) for p in segment.split("&") if "=" in p)
            if params.get("en") == "generate_lead":
                found.append(urllib.parse.unquote(params.get("ep.lead_method", "")))
    return found


def new_page(ctx, posts):
    ctx.route(
        "**/api/**",
        lambda r: r.fulfill(
            status=200,
            headers={"Content-Type": "application/json"},
            body='{"success":true,"ok":true,"orderId":"verify-1"}',
        ),
    )
    # Convex websocket / http traffic is irrelevant to the lead event.
    ctx.route("**/convex.cloud/**", lambda r: r.abort())
    page = ctx.new_page()
    page.on(
        "request",
        lambda r: posts.append(r.post_data)
        if ("analytics" in r.url and r.method == "POST" and r.post_data)
        else None,
    )
    return page


def drive(page, name):
    if name.startswith("/contact-us"):
        page.goto(f"{BASE}/contact-us", wait_until="networkidle", timeout=60000)
        page.fill('input[name="fullName"]', "Lead Verify")
        page.fill('input[name="email"]', "verify@example.com")
        page.fill('input[name="phone"]', "0900000000")
        page.fill('textarea[name="feedback"]', "verification run")
        page.click('form button[type="submit"]')
    elif name.startswith("/contact form"):
        page.goto(f"{BASE}/contact", wait_until="networkidle", timeout=60000)
        page.fill("form input:not([type=email])", "Lead Verify")
        page.fill("form input[type=email]", "verify@example.com")
        page.fill("form textarea", "verification run")
        page.click('form button[type="submit"]')
    elif name.startswith("/books/purchase"):
        page.goto(f"{BASE}/books/purchase", wait_until="networkidle", timeout=60000)
        page.fill("#fullName", "Lead Verify")
        page.fill("#phone", "0900000000")
        page.fill("#address", "1 Duong Test, Ha Noi")
        page.click('form button[type="submit"]')
    elif name.startswith("tel:"):
        page.goto(f"{BASE}/", wait_until="networkidle", timeout=60000)
        # Wait for the messenger FAB: its presence means React has hydrated and
        # GA4Tracker's delegated click listener is mounted. Without this the
        # injected click can fire before the listener exists (flaky run).
        page.wait_for_selector('button[aria-label="Open messenger"]', timeout=30000)
        # Injected because the shipped site has no tel: CTA yet; this exercises
        # the site-wide delegated capture that covers future CTAs.
        page.evaluate(
            """()=>{const a=document.createElement('a');a.id='vtel';a.href='tel:+84901234567';
               a.textContent='Goi ngay';a.addEventListener('click',e=>e.preventDefault());
               document.body.appendChild(a);}"""
        )
        page.dispatch_event("#vtel", "click")
    elif name.startswith("zalo"):
        page.goto(f"{BASE}/", wait_until="networkidle", timeout=60000)
        page.wait_for_selector('button[aria-label="Open messenger"]', timeout=30000)
        page.evaluate(
            """()=>{const a=document.createElement('a');a.id='vzalo';a.href='https://zalo.me/84901234567';
               a.textContent='Zalo';a.addEventListener('click',e=>e.preventDefault());
               document.body.appendChild(a);}"""
        )
        page.dispatch_event("#vzalo", "click")
    elif name.startswith("messenger"):
        page.goto(f"{BASE}/", wait_until="networkidle", timeout=60000)
        page.wait_for_selector('button[aria-label="Open messenger"]', timeout=30000)
        page.click('button[aria-label="Open messenger"]')
    else:
        raise ValueError(name)
    page.wait_for_timeout(2500)


def main():
    results = {}
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=EXE, args=["--no-sandbox"])
        for name, method in SCENARIOS:
            posts = []
            ctx = browser.new_context(locale="vi-VN")
            page = new_page(ctx, posts)
            drive(page, name)
            results[name] = page.evaluate(DL_QUERY)
            # Wait out GA's batch timer, then navigate away to force the beacon.
            page.wait_for_timeout(6000)
            page.goto("about:blank")
            page.wait_for_timeout(2500)
            results[name + "  [wire]"] = wire_lead_methods(posts)
            ctx.close()
        browser.close()

    print("### A) window.dataLayer generate_lead events")
    print(json.dumps(results, ensure_ascii=False, indent=1))

    print("\n### B) POST bodies to google-analytics.com/g/collect")
    failures = []
    for name, method in SCENARIOS:
        dl_ok = any(e.get("lead_method") == method for e in results.get(name, []))
        wire_ok = method in results.get(name + "  [wire]", [])
        status = "OK  " if (dl_ok and wire_ok) else "FAIL"
        print(f"  {status} {name:<38} dataLayer={dl_ok}  wire={wire_ok}")
        if not (dl_ok and wire_ok):
            failures.append(name)

    print()
    if failures:
        print("FAIL: " + ", ".join(failures))
        raise SystemExit(1)
    print(f"PASS -- all {len(SCENARIOS)} lead points fire generate_lead and it reaches GA4")


if __name__ == "__main__":
    main()
