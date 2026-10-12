#!/usr/bin/env python3
"""Verify every hdpedu.com lead point fires the GA4 event `generate_lead`.

This is the acceptance check for HDP-14 ("Gan event lead (generate_lead) tren
hdpedu.com"). It drives a real Chromium through each lead conversion point.

Each scenario asserts two independent signals:

  A) QUEUED -- `window.dataLayer` holds an `event: generate_lead` entry with the
     expected `lead_method` param. This proves the conversion point ran the
     tracking code.
  B) SENT -- a real POST reached https://www.google-analytics.com/g/collect.
     This proves the GA4 library actually transmitted a beacon (not just that
     something was queued).

Both are required. A alone can pass while a CSP/blocker silently drops the
send; B alone can pass for an unrelated page_view.

Usage:
    BASE=https://hdpedu.com python3 scripts/verify-generate-lead.py

    # against the built OpenNext Worker (the artifact that ships):
    npx opennextjs-cloudflare preview -- --port 4000
    BASE=http://127.0.0.1:4000 python3 scripts/verify-generate-lead.py

    # against a dev server of the change:
    pnpm exec next dev -p 3999 &
    BASE=http://127.0.0.1:3999 python3 scripts/verify-generate-lead.py

Requirements: playwright + a Chromium build. Not a package.json dependency --
run it from a venv that has playwright (e.g. ~/scrapling-venv) or with
`npx playwright`. Override the browser with CHROME_PATH if needed.

Known measurement limits -- do not misread a pass or a failure:

  * GA batches events and only flushes on its own timer or on pagehide, so the
    run waits out the batch interval then navigates away to force the beacon.
    Without that flush, signal B is empty even when the event is queued fine.
  * Signal B proves a beacon was SENT. Reading the beacon's body is not
    possible on a production build: GA uses fetch/sendBeacon, and Playwright
    exposes no post_data for it (verified -- post_data, post_data_buffer, CDP
    getRequestPostData and a page-level fetch wrapper all come back empty).
    Body content is therefore only asserted where it IS readable, i.e. on the
    dev server. On a production build, signal A carries the param assertion.
  * Neither signal proves the event is visible in the GA4 property. That needs
    GA4 DebugView (real-time) or the GA4 Data API (hours of processing delay).

Caveat: run against a build to prove the shipped bundle emits the event; run
against the dev server to prove the working tree does.
"""

import json
import os
import urllib.parse

from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE", "http://127.0.0.1:3999").rstrip("/")
EXE = os.environ.get(
    "CHROME_PATH", "/home/n00bie/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome"
)

# Read dataLayer without JSON.stringify over arbitrary objects: on a production
# React build gtag can retain a React fiber reference, and stringifying it
# throws "Converting circular structure to JSON". Only primitives are pulled
# out, so the read is always safe.
DL_QUERY = (
    "()=>{const out=[];for(const e of (window.dataLayer||[])){"
    "if(!e)continue;"
    "let name=null,params=null;"
    "if(typeof e==='object'&&e.length!==undefined){name=e[1];params=e[2];}"
    "else{name=e.event;params=e;}"
    "if(name!=='generate_lead')continue;"
    "const clean={};"
    "if(params&&typeof params==='object'){for(const k of Object.keys(params)){"
    "const v=params[k];if(v===null||['string','number','boolean'].includes(typeof v))clean[k]=v;}}"
    "out.push(clean);}"
    "return out;}"
)

# (scenario name, expected lead_method)
SCENARIOS = [
    ("/contact-us form submit success", "contact_form"),
    ("/contact form submit success", "contact_form"),
    ("/books/purchase form submit success", "book_order"),
    ("tel: link click", "phone"),
    ("zalo.me link click", "zalo"),
    ("messenger dock open (guest)", "messenger_dock"),
]


def wire_lead_methods(posts):
    """GA sends one POST body with its events separated by CRLF.

    Only readable on the dev server; a production build returns [] here.
    """
    found = []
    for body in posts:
        for segment in body.replace("\r\n", "\n").split("\n"):
            if not segment.strip():
                continue
            params = dict(p.split("=", 1) for p in segment.split("&") if "=" in p)
            if params.get("en") == "generate_lead":
                found.append(urllib.parse.unquote(params.get("ep.lead_method", "")))
    return found


def new_page(ctx, ga_posts):
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
        lambda r: ga_posts.append(r.post_data or "")
        if ("google-analytics.com/g/collect" in r.url and r.method == "POST")
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
    elif name.startswith("tel:") or name.startswith("zalo"):
        page.goto(f"{BASE}/", wait_until="networkidle", timeout=60000)
        # Wait for the messenger FAB: its presence means React has hydrated and
        # GA4Tracker's delegated click listener is mounted. Without this the
        # injected click can fire before the listener exists (flaky run).
        page.wait_for_selector('button[aria-label="Open messenger"]', timeout=30000)
        # Injected because the shipped site has no tel:/zalo CTA yet; this
        # exercises the site-wide delegated capture that covers future CTAs.
        tel = name.startswith("tel:")
        href = "tel:+84901234567" if tel else "https://zalo.me/84901234567"
        label = "Goi ngay" if tel else "Zalo"
        page.evaluate(
            """([href,label,tel])=>{const a=document.createElement('a');
               a.id='vcta';a.href=href;a.textContent=label;
               a.addEventListener('click',e=>e.preventDefault());
               document.body.appendChild(a);}""",
            [href, label, tel],
        )
        page.dispatch_event("#vcta", "click")
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
            ga_posts = []
            ctx = browser.new_context(locale="vi-VN")
            page = new_page(ctx, ga_posts)
            drive(page, name)
            results[name] = page.evaluate(DL_QUERY)
            # Wait out GA's batch timer, then navigate away to force the beacon.
            page.wait_for_timeout(6000)
            page.goto("about:blank")
            page.wait_for_timeout(2500)
            results[name + "  [sent]"] = len(ga_posts)
            results[name + "  [body]"] = wire_lead_methods(ga_posts)
            ctx.close()
        browser.close()

    print(f"### target: {BASE}")
    print("### A) window.dataLayer generate_lead entries")
    print(json.dumps({k: v for k, v in results.items() if "[" not in k},
                     ensure_ascii=False, indent=1))

    print("\n### B) POST to google-analytics.com/g/collect")
    body_readable = any(results.get(n + "  [body]") for n, _ in SCENARIOS)
    failures = []
    for name, method in SCENARIOS:
        queued = any(e.get("lead_method") == method for e in results.get(name, []))
        sent = results.get(name + "  [sent]", 0) > 0
        body = results.get(name + "  [body]", [])
        body_ok = method in body if body_readable else None
        ok = queued and sent and (body_ok is not False)
        tag = "OK  " if ok else "FAIL"
        extra = f"  body={body_ok}" if body_readable else ""
        print(f"  {tag} {name:<38} queued={queued}  sent={sent}{extra}")
        if not ok:
            failures.append(name)

    print()
    if not body_readable:
        print("  note: beacon body not readable on this build (GA uses fetch/"
              "sendBeacon);")
        print("        body content asserted only where readable (dev server).")
    if failures:
        print("FAIL: " + ", ".join(failures))
        raise SystemExit(1)
    print(f"PASS -- all {len(SCENARIOS)} lead points queue generate_lead and send a "
          "beacon to GA4")


if __name__ == "__main__":
    main()
