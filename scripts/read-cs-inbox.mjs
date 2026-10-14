#!/usr/bin/env node
/**
 * Đọc hộp thư vào của HDP EDU (cs@hdpedu.com) — HDP-16.
 *
 * Mục đích: cho Bán hàng một ĐƯỜNG ĐỌC thư trả lời thật. Trước đây `cs@hdpedu.com`
 * là hộp Zoho Mail không agent/process nào đọc, nên lead trả lời là rơi vào hộp mù.
 *
 * Hai chế độ, tự chọn theo credential đang có:
 *
 *   1. `resend` (mặc định khi có RESEND_API_KEY): đọc qua Resend Inbound API.
 *      Cần domain con `reply.hdpedu.com` đã verify + MX trỏ về Resend.
 *   2. `imap` (khi có CS_INBOX_IMAP_USER + CS_INBOX_IMAP_PASSWORD): đọc thẳng
 *      hộp Zoho qua IMAP. Không cần đổi DNS, nhưng cần app-password của Zoho.
 *
 * Chạy:
 *   node scripts/read-cs-inbox.mjs --dry-run          # chỉ in ra, không ghi state
 *   node scripts/read-cs-inbox.mjs --json             # xuất JSON gọn cho routine
 *   node scripts/read-cs-inbox.mjs --since-days 7
 *
 * KHÔNG BAO GIỜ in credential ra stdout/log.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { selectNewReplies, matchLead, formatReplyMarkdown, isAllowedSender } from './lib/cs-inbox.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const STATE_DIR = process.env.CS_INBOX_STATE_DIR || path.join(ROOT, '.cs-inbox');
const STATE_FILE = path.join(STATE_DIR, 'state.json');
const LEADS_FILE = process.env.CS_INBOX_LEADS_FILE || path.join(STATE_DIR, 'b2b-leads.json');

function parseArgs(argv) {
  const args = { dryRun: false, json: false, sinceDays: 14, limit: 50, mode: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--json') args.json = true;
    else if (arg === '--since-days') args.sinceDays = Number(argv[++i]);
    else if (arg === '--limit') args.limit = Number(argv[++i]);
    else if (arg === '--mode') args.mode = argv[++i];
    else if (arg === '--help' || arg === '-h') args.help = true;
  }
  return args;
}

const HELP = `Đọc hộp thư vào cs@hdpedu.com (HDP-16)

  --mode resend|imap   Bắt buộc chọn chế độ (mặc định: tự dò)
  --since-days N       Chỉ lấy thư trong N ngày (mặc định 14)
  --limit N            Số thư tối đa mỗi lần (mặc định 50)
  --dry-run            Không ghi state, không đánh dấu đã đọc
  --json               Xuất JSON gọn (dùng cho routine)
  -h, --help           Trợ giúp

Biến môi trường:
  RESEND_API_KEY            đọc qua Resend Inbound (chế độ resend)
  CS_INBOX_IMAP_USER        tài khoản Zoho (chế độ imap)
  CS_INBOX_IMAP_PASSWORD    app-password Zoho (chế độ imap)
  CS_INBOX_IMAP_HOST        mặc định imappro.zoho.com
  CS_INBOX_SENDER_ALLOWLIST danh sách cách nhau dấu phẩy (rỗng = nhận tất cả)
  CS_INBOX_STATE_DIR        nơi lưu state.json + b2b-leads.json
`;

function loadJson(file, fallback) {
  try {
    if (!existsSync(file)) return fallback;
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function saveJson(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Thiếu biến môi trường ${name}`);
  return value;
}

// ---------------------------------------------------------------------------
// Chế độ 1: Resend Inbound
// ---------------------------------------------------------------------------

async function fetchResendReplies(args) {
  const apiKey = requireEnv('RESEND_API_KEY');
  const cutoff = Date.now() - args.sinceDays * 24 * 60 * 60 * 1000;

  const listRes = await fetch(`https://api.resend.com/emails/receiving?limit=${args.limit}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!listRes.ok) {
    throw new Error(`Resend list thất bại: HTTP ${listRes.status} ${(await listRes.text()).slice(0, 300)}`);
  }
  const list = await listRes.json();

  const messages = [];
  for (const item of list.data || []) {
    const receivedAt = item.created_at ? new Date(item.created_at).getTime() : 0;
    if (receivedAt && receivedAt < cutoff) continue;

    // Danh sách không trả body đầy đủ — lấy chi tiết từng thư.
    const detailRes = await fetch(`https://api.resend.com/emails/receiving/${item.id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!detailRes.ok) continue;
    const detail = await detailRes.json();

    messages.push({
      id: detail.id || item.id,
      from: Array.isArray(detail.from) ? detail.from[0] : detail.from || (Array.isArray(item.from) ? item.from[0] : item.from),
      fromName: detail.from_name || null,
      to: Array.isArray(detail.to) ? detail.to[0] : detail.to || (Array.isArray(item.to) ? item.to[0] : item.to),
      subject: detail.subject || item.subject,
      receivedAt: detail.created_at || item.created_at,
      body: detail.text || detail.html || '',
      headers: detail.headers || {},
    });
  }
  return messages;
}

// ---------------------------------------------------------------------------
// Chế độ 2: Zoho IMAP
// ---------------------------------------------------------------------------

async function fetchImapReplies(args) {
  const { ImapFlow } = await import('imapflow');
  const client = new ImapFlow({
    // MX của hdpedu.com là mx.zoho.com (US DC) → IMAP là imap.zoho.com.
    // Đổi bằng CS_INBOX_IMAP_HOST nếu tài khoản nằm ở DC khác (imappro.zoho.com).
    host: process.env.CS_INBOX_IMAP_HOST || 'imap.zoho.com',
    port: Number(process.env.CS_INBOX_IMAP_PORT || 993),
    secure: true,
    auth: {
      user: requireEnv('CS_INBOX_IMAP_USER'),
      pass: requireEnv('CS_INBOX_IMAP_PASSWORD'),
    },
    logger: false,
  });

  const messages = [];
  await client.connect();
  try {
    const lock = await client.getMailboxLock('INBOX');
    try {
      const since = new Date(Date.now() - args.sinceDays * 24 * 60 * 60 * 1000);
      // Cố tình KHÔNG lọc `seen: false`: nếu chủ hộp mở thư trong webmail Zoho,
      // thư thành \Seen và sẽ bị bỏ sót. Thay vào đó lấy mọi thư trong cửa sổ
      // thời gian rồi tự khử trùng theo UID trong state.json.
      for await (const message of client.fetch({ since }, { envelope: true, source: true, headers: true })) {
        if (messages.length >= args.limit) break;
        const envelope = message.envelope || {};
        const from = envelope.from?.[0];
        const to = envelope.to?.[0];
        messages.push({
          id: message.uid ? `imap:${message.uid}` : `imap-seq:${message.seq}`,
          from: from?.address || null,
          fromName: from?.name || null,
          to: to?.address || null,
          subject: envelope.subject || '(không có tiêu đề)',
          receivedAt: envelope.date || message.internalDate,
          body: message.source ? message.source.toString('utf8') : '',
          headers: message.headers ? Object.fromEntries(message.headers) : {},
          uid: message.uid,
        });
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => {});
  }
  return messages;
}

// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(HELP);
    return 0;
  }

  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasImap = Boolean(process.env.CS_INBOX_IMAP_USER && process.env.CS_INBOX_IMAP_PASSWORD);
  const mode = args.mode || (hasImap ? 'imap' : hasResend ? 'resend' : null);

  if (!mode) {
    const result = {
      ok: false,
      mode: null,
      reason: 'no_credential',
      message:
        'Không có đường đọc nào. Cần RESEND_API_KEY (Resend Inbound) hoặc CS_INBOX_IMAP_USER + CS_INBOX_IMAP_PASSWORD (Zoho IMAP).',
    };
    process.stdout.write(args.json ? `${JSON.stringify(result)}\n` : `${result.message}\n`);
    return 2;
  }

  const state = loadJson(STATE_FILE, { seenIds: [], lastRunAt: null });
  const leads = loadJson(LEADS_FILE, []);
  const allowlist = (process.env.CS_INBOX_SENDER_ALLOWLIST || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  let messages;
  try {
    messages = mode === 'imap' ? await fetchImapReplies(args) : await fetchResendReplies(args);
  } catch (error) {
    // imapflow báo lỗi xác thực bằng cờ `authenticationFailed`, không phải theo
    // `error.name` (name là "Error", message là "Command failed" chung chung).
    const isAuth =
      error?.authenticationFailed === true ||
      /invalid credentials|auth/i.test(String(error?.responseText || '')) ||
      /invalid credentials|auth/i.test(String(error?.message || ''));
    const result = {
      ok: false,
      mode,
      reason: isAuth ? 'auth_failed' : 'fetch_failed',
      message: isAuth
        ? `Đăng nhập ${mode} thất bại (${error?.responseText || 'invalid credentials'}). Với Zoho phải dùng app-password, không phải mật khẩu đăng nhập web.`
        : String(error.message || error),
    };
    process.stdout.write(args.json ? `${JSON.stringify(result)}\n` : `${result.message}\n`);
    return 1;
  }

  const allowed = messages.filter((m) => isAllowedSender(m.from, allowlist));
  const { replies, seenIds, skippedAutomatic, skippedSeen } = selectNewReplies(allowed, state.seenIds);
  const withLead = replies.map((reply) => ({ ...reply, matchedLead: matchLead(reply.from, leads) }));

  if (!args.dryRun) {
    saveJson(STATE_FILE, {
      seenIds,
      lastRunAt: new Date().toISOString(),
      lastMode: mode,
    });
  }

  const result = {
    ok: true,
    mode,
    checkedAt: new Date().toISOString(),
    mailbox: process.env.CS_INBOX_IMAP_USER || 'cs@hdpedu.com',
    fetched: messages.length,
    newReplies: withLead.length,
    skippedAutomatic,
    skippedSeen,
    blockedByAllowlist: messages.length - allowed.length,
    replies: withLead,
  };

  if (args.json) {
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } else {
    process.stdout.write(`Hộp ${result.mailbox} — chế độ ${mode}\n`);
    process.stdout.write(`Lấy ${result.fetched} thư · mới ${result.newReplies} · tự động ${skippedAutomatic} · đã đọc ${skippedSeen}\n\n`);
    if (!withLead.length) {
      process.stdout.write('Không có thư trả lời mới.\n');
    } else {
      withLead.forEach((reply, index) => process.stdout.write(`${formatReplyMarkdown(reply, index + 1)}\n`));
    }
  }
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    process.stderr.write(`Lỗi: ${error.message}\n`);
    process.exit(1);
  });
