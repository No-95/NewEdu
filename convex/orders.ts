import { query } from './_generated/server';
import { v } from 'convex/values';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Tổng `amount` của một tập bản ghi. */
function total<T extends { amount: number }>(rows: T[]): number {
  return rows.reduce((sum, row) => sum + (row.amount ?? 0), 0);
}

/**
 * Đường đọc số đơn / doanh thu thật cho Bán hàng (HDP-15).
 *
 * QUY TẮC RIÊNG TƯ: hàm này KHÔNG cần auth nhưng TUYỆT ĐỐI không trả thông tin
 * khách hàng (tên, email, SĐT, địa chỉ). Chỉ trả số đếm và tổng tiền.
 * Không thêm bất kỳ trường nào nhận diện được cá nhân vào đây.
 *
 * Nguồn số liệu:
 * - `purchases`   — đơn mua khoá học (có `amount`), trạng thái active/pending/failed.
 * - `bookOrders`  — đơn sách; schema KHÔNG lưu giá trị tiền, nên chỉ đếm được số đơn.
 * - `transactions` — sổ ví (deposit/purchase).
 */
export const getSalesSummary = query({
  args: { sinceDays: v.optional(v.number()) },
  returns: v.object({
    generatedAt: v.number(),
    windowDays: v.union(v.number(), v.null()),
    totalOrders: v.number(),
    totalRevenue: v.number(),
    currency: v.literal('VND'),
    courseOrdersPaid: v.number(),
    courseOrdersPending: v.number(),
    courseOrdersFailed: v.number(),
    courseRevenue: v.number(),
    bookOrders: v.number(),
    bookOrdersLast30d: v.number(),
    transactionsTotal: v.number(),
    depositTotal: v.number(),
    transactionPurchaseTotal: v.number(),
    notes: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const windowDays = args.sinceDays && args.sinceDays > 0 ? args.sinceDays : null;
    const since = windowDays === null ? null : now - windowDays * DAY_MS;
    /** Giới hạn theo cửa sổ thời gian; `since === null` nghĩa là toàn bộ thời gian. */
    const within = <T extends { createdAt: number }>(rows: T[]) =>
      since === null ? rows : rows.filter((row) => row.createdAt >= since);

    const purchases = within(await ctx.db.query('purchases').collect());
    const paid = purchases.filter((p) => p.status === 'active');
    const courseRevenue = total(paid);

    const bookOrders = await ctx.db.query('bookOrders').collect();
    const scopedBookOrders = within(bookOrders);

    const transactions = within(await ctx.db.query('transactions').collect());

    return {
      generatedAt: now,
      windowDays,
      totalOrders: paid.length + scopedBookOrders.length,
      totalRevenue: courseRevenue,
      currency: 'VND' as const,
      courseOrdersPaid: paid.length,
      courseOrdersPending: purchases.filter((p) => p.status === 'pending').length,
      courseOrdersFailed: purchases.filter((p) => p.status === 'failed').length,
      courseRevenue,
      bookOrders: scopedBookOrders.length,
      bookOrdersLast30d: bookOrders.filter((b) => b.createdAt >= now - 30 * DAY_MS).length,
      transactionsTotal: transactions.length,
      depositTotal: total(transactions.filter((t) => t.type === 'deposit')),
      transactionPurchaseTotal: total(transactions.filter((t) => t.type === 'purchase')),
      notes: [
        'totalOrders = đơn khoá học đã kích hoạt (purchases.status=active) + đơn sách (bookOrders).',
        'totalRevenue chỉ gồm tiền khoá học đã kích hoạt; bookOrders không lưu giá trị tiền nên đơn sách không cộng vào doanh thu.',
        'Chỉ trả số đếm và tổng tiền — không có thông tin khách hàng.',
      ],
    };
  },
});
