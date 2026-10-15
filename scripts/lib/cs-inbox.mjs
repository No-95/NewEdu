/**
 * Pure helpers for the cs@hdpedu.com inbound read path (HDP-16).
 *
 * Kept free of I/O so the behaviour that matters — deciding which message is a
 * real customer reply, normalising it, and de-duplicating across polls — is
 * unit-testable without an IMAP server or a Resend account.
 */

/** Addresses that are never a customer reply. */
const AUTOMATIC_LOCALPARTS = [
  'no-reply',
  'noreply',
  'donotreply',
  'do-not-reply',
  'mailer-daemon',
  'postmaster',
  'bounce',
  'notifications',
];

/**
 * Parse an RFC 5322 address such as `"Nguyễn Văn A" <a@b.com>` down to the
 * bare lower-cased address. Returns null when no address is present.
 */
export function normalizeAddress(raw) {
  if (!raw) return null;
  const text = String(raw).trim();
  const angled = text.match(/<([^<>]+)>/);
  const candidate = (angled ? angled[1] : text).trim().replace(/^["']|["']$/g, '');
  const address = candidate.match(/[^\s,;]+@[^\s,;>]+/);
  if (!address) return null;
  return address[0].toLowerCase().replace(/[.,;:]+$/, '');
}

/**
 * Domains that are HDP EDU's own sending/receiving identities. Mail from these
 * is never a customer reply: it is our own outbound (or a test echo of it)
 * landing back in the inbound mailbox. A subdomain such as `reply.hdpedu.com`
 * is covered by the suffix check.
 */
export const DEFAULT_SELF_DOMAINS = ['hdpedu.com'];

/**
 * True when the sender belongs to one of our own domains. Without this filter
 * the reader counts its own test/echo mail as a new customer reply, which is a
 * false positive that corrupts the sales reply queue.
 */
export function isSelfSent(fromAddress, selfDomains = DEFAULT_SELF_DOMAINS) {
  const address = normalizeAddress(fromAddress);
  if (!address) return false;
  const domain = addressDomain(address);
  if (!domain) return false;
  return selfDomains.some((entry) => {
    const self = String(entry).trim().toLowerCase().replace(/^@/, '');
    if (!self) return false;
    return domain === self || domain.endsWith(`.${self}`);
  });
}

/** The domain part of a normalised address, or null. */
export function addressDomain(address) {
  if (!address) return null;
  const at = address.lastIndexOf('@');
  return at === -1 ? null : address.slice(at + 1);
}

/**
 * True when a message looks machine-generated rather than a human reply:
 * auto-submitted headers, bulk/list headers, or an automatic localpart.
 */
export function isAutomaticMessage(message) {
  const headers = message.headers || {};
  const headerValue = (name) => {
    const key = Object.keys(headers).find((k) => k.toLowerCase() === name);
    return key ? String(headers[key] ?? '') : '';
  };

  const autoSubmitted = headerValue('auto-submitted').toLowerCase();
  if (autoSubmitted && autoSubmitted !== 'no') return true;
  if (headerValue('x-autoreply') || headerValue('x-autorespond')) return true;
  if (headerValue('precedence').toLowerCase().match(/bulk|junk|list/)) return true;
  if (headerValue('list-unsubscribe')) return true;

  const from = normalizeAddress(message.from);
  if (!from) return true;
  const localpart = from.split('@')[0];
  return AUTOMATIC_LOCALPARTS.some(
    (prefix) => localpart === prefix || localpart.startsWith(`${prefix}.`) || localpart.startsWith(`${prefix}+`),
  );
}

/** Collapse whitespace and trim a reply body to a readable preview. */
export function previewText(body, maxLength = 400) {
  const collapsed = String(body || '')
    .replace(/\r\n/g, '\n')
    // Strip quoted history so the preview shows what the customer actually wrote.
    .split(/\n(?=>)|^On .+wrote:$|^-{2,}\s*Original Message\s*-{2,}/m)[0]
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (collapsed.length <= maxLength) return collapsed;
  return `${collapsed.slice(0, maxLength - 1).trimEnd()}…`;
}

/**
 * Convert any timestamp-ish input to an ISO string, or null when it is absent
 * or unparseable. `new Date(x).toISOString()` throws a RangeError on a bad
 * value, which would abort a whole poll over one malformed header.
 */
export function toIsoOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  const time = date.getTime();
  return Number.isFinite(time) ? date.toISOString() : null;
}

/**
 * Normalise one raw inbound message into the shape posted to the issue.
 * `id` must be stable across polls for the same message.
 */
export function toInboundReply(message, options = {}) {
  const from = normalizeAddress(message.from);
  return {
    id: String(message.id),
    from,
    fromName: message.fromName ? String(message.fromName).trim() : null,
    to: normalizeAddress(message.to),
    subject: String(message.subject || '(không có tiêu đề)').trim(),
    receivedAt: toIsoOrNull(message.receivedAt),
    preview: previewText(message.body, options.previewLength),
    matchedLead: options.matchedLead || null,
  };
}

/**
 * Drop automatic messages, normalise the rest, and remove ids already seen.
 * Returns the new replies plus the full id set to persist for the next poll.
 */
export function selectNewReplies(messages, seenIds = [], options = {}) {
  const seen = new Set(seenIds.map(String));
  const selfDomains = options.selfDomains || DEFAULT_SELF_DOMAINS;
  const accepted = [];
  let skippedAutomatic = 0;
  let skippedSeen = 0;
  let skippedSelfSent = 0;

  for (const message of messages) {
    if (seen.has(String(message.id))) {
      skippedSeen += 1;
      continue;
    }
    if (isAutomaticMessage(message)) {
      skippedAutomatic += 1;
      continue;
    }
    // Thư do chính HDP EDU gửi (kể cả thư kiểm chứng round-trip) rơi lại hộp vào
    // KHÔNG phải khách trả lời. Đếm riêng để nhật ký routine nói đúng sự thật.
    if (isSelfSent(message.from, selfDomains)) {
      skippedSelfSent += 1;
      continue;
    }
    accepted.push(toInboundReply(message, options));
  }

  // Newest last, so the issue comment reads oldest → newest. Messages with an
  // unparseable date sort first rather than crashing the comparison.
  accepted.sort((a, b) => {
    const left = a.receivedAt ? Date.parse(a.receivedAt) : 0;
    const right = b.receivedAt ? Date.parse(b.receivedAt) : 0;
    return left - right;
  });

  return {
    replies: accepted,
    seenIds: [...new Set([...seen, ...messages.map((m) => String(m.id))])],
    skippedAutomatic,
    skippedSeen,
    skippedSelfSent,
  };
}

/**
 * Match a reply sender to a company on the B2B outreach list, so Sales sees
 * which campaign the answer belongs to. Match is on the email domain first
 * (the same domain can have several contacts), then on the exact address.
 */
export function matchLead(fromAddress, leads = []) {
  const address = normalizeAddress(fromAddress);
  if (!address) return null;
  const domain = addressDomain(address);

  const byAddress = leads.find((lead) => normalizeAddress(lead.email) === address);
  if (byAddress) return { company: byAddress.company || null, contact: byAddress.contact || null, email: byAddress.email };

  const byDomain = leads.find((lead) => addressDomain(normalizeAddress(lead.email)) === domain);
  if (byDomain) return { company: byDomain.company || null, contact: null, email: byDomain.email };

  return null;
}

/** Render the markdown block Sales reads for one reply. */
export function formatReplyMarkdown(reply, index) {
  const lines = [
    `### ${index}. ${reply.subject}`,
    '',
    `- **Từ:** ${reply.fromName ? `${reply.fromName} <${reply.from}>` : reply.from}`,
    `- **Tới:** ${reply.to}`,
    `- **Lúc:** ${reply.receivedAt}`,
    `- **ID:** \`${reply.id}\``,
  ];
  if (reply.matchedLead) {
    const company = reply.matchedLead.company || '(không rõ công ty)';
    lines.push(`- **Khớp danh sách B2B:** ${company}${reply.matchedLead.contact ? ` — ${reply.matchedLead.contact}` : ''}`);
  }
  lines.push('', '> ' + reply.preview.replace(/\n/g, '\n> '), '');
  return lines.join('\n');
}

/**
 * Decide whether a sender is allowed to be read by the reader.
 * An empty allowlist means "anyone" (the mailbox is public-facing by design).
 */
export function isAllowedSender(fromAddress, allowlist = []) {
  if (!allowlist.length) return true;
  const address = normalizeAddress(fromAddress);
  if (!address) return false;
  const domain = addressDomain(address);
  return allowlist.some((entry) => {
    const allowed = String(entry).trim().toLowerCase();
    return allowed.startsWith('@') ? domain === allowed.slice(1) : normalizeAddress(allowed) === address;
  });
}
