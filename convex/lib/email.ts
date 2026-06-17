function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function interpolateTemplate(text: string, params?: Record<string, string>) {
  if (!params) return text;
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, value),
    text
  );
}

export function wrapNotificationEmail(args: {
  title: string;
  body: string;
  href?: string;
  ctaLabel?: string;
}) {
  const siteUrl = (process.env.SITE_URL || 'https://hdpedu.com').replace(/\/+$/, '');
  const ctaHref = args.href ? `${siteUrl}${args.href.startsWith('/') ? args.href : `/${args.href}`}` : siteUrl;
  const ctaLabel = escapeHtml(args.ctaLabel || 'Open HDP EDU');

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:560px">
      <h2 style="margin:0 0 12px;color:#0f172a">${escapeHtml(args.title)}</h2>
      <p style="margin:0 0 20px;color:#334155">${escapeHtml(args.body)}</p>
      <a href="${escapeHtml(ctaHref)}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:600">${ctaLabel}</a>
      <p style="margin:24px 0 0;font-size:12px;color:#64748b">HDP EDU — Korean language education platform</p>
    </div>
  `;
}

export async function sendEmail(args: { to: string; subject: string; html: string }) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('RESEND_API_KEY is missing — email not sent.');
    return { ok: false as const, error: 'Missing RESEND_API_KEY' };
  }

  const from = process.env.RESEND_FROM_EMAIL || 'HDP EDU <onboarding@resend.dev>';
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: args.to.trim(),
      subject: args.subject,
      html: args.html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Resend email failed:', errorText);
    return { ok: false as const, error: errorText };
  }

  return { ok: true as const };
}

export { escapeHtml };
