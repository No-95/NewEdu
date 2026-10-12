import { query } from './_generated/server';
import { v } from 'convex/values';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Đường đọc số đơn / doanh thu thật cho Bán hàng (HDP-15).
 *
 * QUY TẮC RIÊNG TƯ: hàm này KHÔNG cần auth nhưng TUYỆT ĐỐI không trả thông tin
 * khách hàng (tên, email, SĐT, địa chỉ). Chỉ trả số đếm và tổng tiền.
 * Không thêm bất kỳ trường nào nhận diện được cá nhân vào đây.
 *
 * Nguồn số liệu:
 * - `purchases`  — đơn mua khoá học (có `amount`), trạng thái active/pending/failed.
 * - `bookOrders` — đơn sách; schema KHÔNG lưu giá trị tiền, nên chỉ đếm được số đơn.
 * - `transactions` — sổ ví (deposit/purchase) đã ghi theo từng user.
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
    const windowDays = args.sinceDays && args.sinceDays > 0 ? args.sinceDays : null;
    const since = windowDays === null ? null : Date.now() - windowDays * DAY_MS;

    const purchases = await ctx.db.query('purchases').collect();
    const scopedPurchases =
      since === null ? purchases : purchases.filter((p) => p.createdAt >= since);

    const paid = scopedPurchases.filter((p) => p.status === 'active');
    const pending = scopedPurchases.filter((p) => p.status === 'pending');
    const failed = scopedPurchases.filter((p) => p.status === 'failed');
    const courseRevenue = paid.reduce((sum, p) => sum + (p.amount ?? 0), 0);

    const bookOrders = await ctx.db.query('bookOrders').collect();
    const scopedBookOrders =
      since === null ? bookOrders : bookOrders.filter((b) => b.createdAt >= since);
    const bookOrdersLast30d = bookOrders.filter(
      (b) => b.createdAt >= Date.now() - 30 * DAY_MS
    ).length;

    const transactions = await ctx.db.query('transactions').collect();
    const scopedTransactions =
      since === null ? transactions : transactions.filter((t) => t.createdAt >= since);
    const depositTotal = scopedTransactions
      .filter((t) => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);
    const transactionPurchaseTotal = scopedTransactions
      .filter((t) => t.type === 'purchase')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      generatedAt: Date.now(),
      windowDays,
      totalOrders: paid.length + scopedBookOrders.length,
      totalRevenue: courseRevenue,
      currency: 'VND' as const,
      courseOrdersPaid: paid.length,
      courseOrdersPending: pending.length,
      courseOrdersFailed: failed.length,
      courseRevenue,
      bookOrders: scopedBookOrders.length,
      bookOrdersLast30d,
      transactionsTotal: scopedTransactions.length,
      depositTotal,
      transactionPurchaseTotal,
      notes: [
        'totalOrders = đơn khoá học đã kích hoạt (purchases.status=active) + đơn sách (bookOrders).',
        'totalRevenue chỉ gồm tiền khoá học đã kích hoạt. Bảng bookOrders không lưu giá trị tiền nên đơn sách không cộng vào doanh thu.',
        'Chỉ trả số đếm và tổng tiền — không có thông tin khách hàng.',
      ],
    };
  },
});
