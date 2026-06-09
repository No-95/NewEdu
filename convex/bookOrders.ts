import { action, internalMutation, mutation, query } from './_generated/server';
import { v } from 'convex/values';

import { api, internal } from './_generated/api';

const DEFAULT_NOTIFY_EMAIL = 'minhhoangd852@gmail.com';
const COURSE_GIFT_SOURCE = 'course_gift';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendBookOrderEmail(args: {
  orderId: string;
  fullName: string;
  phone: string;
  address: string;
  note?: string;
  sourceLabel: string;
  subjectPrefix: string;
  emailHeading: string;
  extraRows?: Array<{ label: string; value: string }>;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is missing on server.');
  }

  const notifyTo = (process.env.BOOK_ORDER_NOTIFY_EMAIL || DEFAULT_NOTIFY_EMAIL).trim();
  const from = process.env.RESEND_FROM_EMAIL || 'HDP EDU <onboarding@resend.dev>';
  const submittedAt = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  const extraHtml = (args.extraRows ?? [])
    .map(
      (row) =>
        `<tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:600">${escapeHtml(row.label)}</td><td style="padding:8px 12px;border:1px solid #ddd">${escapeHtml(row.value)}</td></tr>`,
    )
    .join('');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: notifyTo,
      subject: `${args.subjectPrefix} — ${args.fullName}`,
      html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
            <h2 style="margin:0 0 12px">${escapeHtml(args.emailHeading)}</h2>
            <p style="margin:0 0 16px;color:#555">${escapeHtml(args.sourceLabel)}</p>
            <table style="border-collapse:collapse;width:100%;max-width:560px">
              <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:600">Mã đơn</td><td style="padding:8px 12px;border:1px solid #ddd">${escapeHtml(args.orderId)}</td></tr>
              ${extraHtml}
              <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:600">Họ và tên</td><td style="padding:8px 12px;border:1px solid #ddd">${escapeHtml(args.fullName)}</td></tr>
              <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:600">Số điện thoại</td><td style="padding:8px 12px;border:1px solid #ddd">${escapeHtml(args.phone)}</td></tr>
              <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:600">Địa chỉ</td><td style="padding:8px 12px;border:1px solid #ddd">${escapeHtml(args.address)}</td></tr>
              <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:600">Ghi chú</td><td style="padding:8px 12px;border:1px solid #ddd">${escapeHtml(args.note || '—')}</td></tr>
              <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:600">Thời gian</td><td style="padding:8px 12px;border:1px solid #ddd">${escapeHtml(submittedAt)}</td></tr>
            </table>
          </div>
        `,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Resend book order email failed:', errorText);
    throw new Error('Không gửi được email thông báo. Vui lòng thử lại sau.');
  }
}

export const createBookOrder = mutation({
  args: {
    fullName: v.string(),
    phone: v.string(),
    address: v.string(),
    note: v.optional(v.string()),
    userId: v.optional(v.string()),
    courseId: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  returns: v.object({ orderId: v.string() }),
  handler: async (ctx, args) => {
    const orderId = await ctx.db.insert('bookOrders', {
      fullName: args.fullName,
      phone: args.phone,
      address: args.address,
      note: args.note,
      userId: args.userId,
      courseId: args.courseId,
      source: args.source,
      createdAt: Date.now(),
    });

    return { orderId };
  },
});

/** One course-gift claim per user account (Nhận sách Free form). */
export const hasCourseGiftClaim = query({
  args: { userId: v.string(), courseId: v.optional(v.string()) },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const byIndex = await ctx.db
      .query('bookOrders')
      .withIndex('by_userId_source', (q) =>
        q.eq('userId', args.userId).eq('source', COURSE_GIFT_SOURCE),
      )
      .first();

    if (byIndex) return true;

    // Legacy rows before source index (same user + course).
    if (args.courseId) {
      const byCourse = await ctx.db
        .query('bookOrders')
        .withIndex('by_user_course', (q) =>
          q.eq('userId', args.userId).eq('courseId', args.courseId),
        )
        .first();
      if (byCourse) return true;
    }

    return false;
  },
});

export const insertCourseGiftBookClaim = internalMutation({
  args: {
    userId: v.string(),
    courseId: v.string(),
    fullName: v.string(),
    phone: v.string(),
    address: v.string(),
    note: v.optional(v.string()),
  },
  returns: v.object({ orderId: v.string() }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('bookOrders')
      .withIndex('by_userId_source', (q) =>
        q.eq('userId', args.userId).eq('source', COURSE_GIFT_SOURCE),
      )
      .first();

    if (existing) {
      throw new Error('Mỗi tài khoản chỉ được đăng ký nhận sách một lần.');
    }

    const legacy = await ctx.db
      .query('bookOrders')
      .withIndex('by_user_course', (q) =>
        q.eq('userId', args.userId).eq('courseId', args.courseId),
      )
      .first();

    if (legacy) {
      throw new Error('Mỗi tài khoản chỉ được đăng ký nhận sách một lần.');
    }

    const orderId = await ctx.db.insert('bookOrders', {
      fullName: args.fullName,
      phone: args.phone,
      address: args.address,
      note: args.note,
      userId: args.userId,
      courseId: args.courseId,
      source: COURSE_GIFT_SOURCE,
      createdAt: Date.now(),
    });

    return { orderId };
  },
});

export const submitBookOrder = action({
  args: {
    fullName: v.string(),
    phone: v.string(),
    address: v.string(),
    note: v.optional(v.string()),
  },
  returns: v.object({ ok: v.literal(true), orderId: v.string() }),
  handler: async (ctx, args) => {
    const fullName = args.fullName.trim();
    const phone = args.phone.trim();
    const address = args.address.trim();
    const note = args.note?.trim();

    if (!fullName || !phone || !address) {
      throw new Error('Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ giao hàng.');
    }

    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 9 || digitsOnly.length > 15) {
      throw new Error('Số điện thoại không hợp lệ.');
    }

    const { orderId } = await ctx.runMutation(api.bookOrders.createBookOrder, {
      fullName,
      phone,
      address,
      note: note || undefined,
      source: 'books_page',
    });

    await sendBookOrderEmail({
      orderId,
      fullName,
      phone,
      address,
      note: note || undefined,
      sourceLabel: 'Gửi từ hdpedu.com/books/purchase',
      subjectPrefix: '[HDP EDU] Đơn đặt mua sách mới',
      emailHeading: 'Đơn đặt mua sách mới',
    });

    return { ok: true as const, orderId };
  },
});

export const submitCourseGiftBook = action({
  args: {
    userId: v.string(),
    courseId: v.string(),
    fullName: v.string(),
    phone: v.string(),
    address: v.string(),
    note: v.optional(v.string()),
  },
  returns: v.object({ ok: v.literal(true), orderId: v.string() }),
  handler: async (ctx, args) => {
    const fullName = args.fullName.trim();
    const phone = args.phone.trim();
    const address = args.address.trim();
    const note = args.note?.trim();
    const courseId = args.courseId.trim();

    if (!fullName || !phone || !address || !courseId) {
      throw new Error('Vui lòng nhập đầy đủ thông tin nhận sách.');
    }

    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 9 || digitsOnly.length > 15) {
      throw new Error('Số điện thoại không hợp lệ.');
    }

    const hasAccess = await ctx.runQuery(api.purchases.hasAccess, {
      userId: args.userId,
      courseId,
    });
    if (!hasAccess) {
      throw new Error('Bạn cần mua khóa học trước khi đăng ký nhận sách.');
    }

    const alreadyClaimed = await ctx.runQuery(api.bookOrders.hasCourseGiftClaim, {
      userId: args.userId,
      courseId,
    });
    if (alreadyClaimed) {
      throw new Error('Mỗi tài khoản chỉ được đăng ký nhận sách một lần.');
    }

    const { orderId } = await ctx.runMutation(internal.bookOrders.insertCourseGiftBookClaim, {
      userId: args.userId,
      courseId,
      fullName,
      phone,
      address,
      note: note || undefined,
    });

    await sendBookOrderEmail({
      orderId,
      fullName,
      phone,
      address,
      note: note || undefined,
      sourceLabel: `Đăng ký nhận sách tặng kèm khóa học — hdpedu.com/courses (${courseId})`,
      subjectPrefix: '[HDP EDU] Bonus đăng ký khóa học',
      emailHeading: 'Bonus đăng ký khóa học',
      extraRows: [
        { label: 'Khóa học', value: courseId },
        { label: 'User ID', value: args.userId },
      ],
    });

    return { ok: true as const, orderId };
  },
});
