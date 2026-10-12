/// <reference types="vite/client" />
import { convexTest } from 'convex-test';
import { describe, it, expect } from 'vitest';
import schema from '../convex/schema';
import { api } from '../convex/_generated/api';

// Load every convex module so convex-test can resolve function references.
const modules = import.meta.glob('../convex/**/*.ts');

const DAY = 24 * 60 * 60 * 1000;

describe('orders.getSalesSummary — đường đọc số đơn/doanh thu cho Bán hàng (HDP-15)', () => {
  it('đếm đúng đơn theo trạng thái và cộng đúng doanh thu đơn đã kích hoạt', async () => {
    const t = convexTest(schema, modules);
    const now = Date.now();

    await t.run(async (ctx) => {
      const userId = await ctx.db.insert('users', {
        email: 'buyer@example.com',
        fullName: 'Người Mua',
        role: 'learner',
        createdAt: now,
        updatedAt: now,
      });

      // 2 đơn đã kích hoạt: 399.000 + 200.000
      await ctx.db.insert('purchases', {
        userId: userId.toString(),
        courseId: 'cam-nang-video-tieng-han-san-xuat',
        provider: 'payos',
        amount: 399000,
        currency: 'VND',
        status: 'active',
        createdAt: now,
      });
      await ctx.db.insert('purchases', {
        userId: userId.toString(),
        courseId: 'khoa-khac',
        provider: 'payos',
        amount: 200000,
        currency: 'VND',
        status: 'active',
        createdAt: now,
      });
      // 1 đơn chờ + 1 đơn hỏng — KHÔNG được cộng vào doanh thu
      await ctx.db.insert('purchases', {
        userId: userId.toString(),
        courseId: 'khoa-cho',
        provider: 'payos',
        amount: 500000,
        currency: 'VND',
        status: 'pending',
        createdAt: now,
      });
      await ctx.db.insert('purchases', {
        userId: userId.toString(),
        courseId: 'khoa-hong',
        provider: 'payos',
        amount: 700000,
        currency: 'VND',
        status: 'failed',
        createdAt: now,
      });

      // 3 đơn sách (bookOrders không lưu amount)
      for (let i = 0; i < 3; i += 1) {
        await ctx.db.insert('bookOrders', {
          fullName: `Khách ${i}`,
          phone: '0900000000',
          address: 'Hà Nội',
          createdAt: now,
        });
      }

      // Sổ ví
      await ctx.db.insert('transactions', {
        userId,
        type: 'deposit',
        amount: 1000000,
        description: 'Nạp ví',
        createdAt: now,
      });
      await ctx.db.insert('transactions', {
        userId,
        type: 'purchase',
        amount: 399000,
        description: 'Mua khoá học',
        createdAt: now,
      });
    });

    const summary = await t.query(api.orders.getSalesSummary, {});

    expect(summary.courseOrdersPaid).toBe(2);
    expect(summary.courseOrdersPending).toBe(1);
    expect(summary.courseOrdersFailed).toBe(1);
    expect(summary.courseRevenue).toBe(599000);
    expect(summary.bookOrders).toBe(3);
    expect(summary.totalOrders).toBe(5); // 2 đơn khoá học active + 3 đơn sách
    expect(summary.totalRevenue).toBe(599000); // chỉ tiền khoá học đã kích hoạt
    expect(summary.currency).toBe('VND');
    expect(summary.depositTotal).toBe(1000000);
    expect(summary.transactionPurchaseTotal).toBe(399000);
    expect(summary.transactionsTotal).toBe(2);
  });

  it('lọc theo sinceDays và KHÔNG trả về thông tin khách hàng', async () => {
    const t = convexTest(schema, modules);
    const now = Date.now();

    await t.run(async (ctx) => {
      await ctx.db.insert('purchases', {
        userId: 'u1',
        courseId: 'c1',
        provider: 'payos',
        amount: 111000,
        currency: 'VND',
        status: 'active',
        createdAt: now - 2 * DAY, // trong 7 ngày
      });
      await ctx.db.insert('purchases', {
        userId: 'u2',
        courseId: 'c2',
        provider: 'payos',
        amount: 222000,
        currency: 'VND',
        status: 'active',
        createdAt: now - 40 * DAY, // ngoài 7 ngày
      });
      await ctx.db.insert('bookOrders', {
        fullName: 'Khách Cũ',
        phone: '0911111111',
        address: 'TP.HCM',
        createdAt: now - 40 * DAY,
      });
    });

    const scoped = await t.query(api.orders.getSalesSummary, { sinceDays: 7 });
    expect(scoped.windowDays).toBe(7);
    expect(scoped.courseOrdersPaid).toBe(1);
    expect(scoped.courseRevenue).toBe(111000);
    expect(scoped.bookOrders).toBe(0);
    expect(scoped.totalOrders).toBe(1);

    const all = await t.query(api.orders.getSalesSummary, {});
    expect(all.windowDays).toBeNull();
    expect(all.courseOrdersPaid).toBe(2);
    expect(all.courseRevenue).toBe(333000);
    expect(all.bookOrders).toBe(1);
    expect(all.totalOrders).toBe(3);

    // Không có bất kỳ trường PII nào trong payload
    const raw = JSON.stringify(all);
    expect(raw).not.toContain('Khách Cũ');
    expect(raw).not.toContain('0911111111');
    expect(raw).not.toContain('TP.HCM');
    expect(raw).not.toContain('@'); // không có email
  });
});
