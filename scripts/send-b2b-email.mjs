#!/usr/bin/env node
/**
 * Gửi email B2B với Reply-To: cs@reply.hdpedu.com (HDP-19).
 *
 * Cách dùng:
 *   node scripts/send-b2b-email.mjs \
 *     --to "nguyen@company.com" \
 *     --subject "Đào tạo tiếng Hàn cho nhân viên sản xuất" \
 *     --body-file message.html
 *
 * Reply-To mặc định: cs@reply.hdpedu.com
 * From mặc định: HDP EDU <cs@hdpedu.com> (hoặc RESEND_FROM_EMAIL)
 *
 * Env cần: RESEND_API_KEY
 * Env tùy chọn: RESEND_FROM_EMAIL, RESEND_REPLY_TO_EMAIL
 */

import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(name);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

const to = getArg('--to');
const subject = getArg('--subject');
const bodyFile = getArg('--body-file');
const replyToOverride = getArg('--reply-to');

if (!to || !subject || !bodyFile) {
  console.error('Usage: node scripts/send-b2b-email.mjs --to <email> --subject <text> --body-file <file.html>');
  process.exit(1);
}

let html;
try {
  html = readFileSync(bodyFile, 'utf-8');
} catch (err) {
  console.error('Cannot read body file:', err.message);
  process.exit(1);
}

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error('RESEND_API_KEY is required');
  process.exit(1);
}

const from = process.env.RESEND_FROM_EMAIL || 'HDP EDU <cs@hdpedu.com>';
const replyTo = replyToOverride || process.env.RESEND_REPLY_TO_EMAIL || 'cs@reply.hdpedu.com';

const res = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from,
    to: to.trim(),
    subject,
    html,
    reply_to: replyTo,
  }),
});

if (!res.ok) {
  const text = await res.text();
  console.error('Resend API error:', res.status, text);
  process.exit(1);
}

const data = await res.json();
console.log(JSON.stringify({ ok: true, id: data.id, reply_to: replyTo, from, to }, null, 2));
