/// <reference types="vite/client" />
import { convexTest } from 'convex-test';
import { describe, it, expect } from 'vitest';
import schema from '../convex/schema';
import { api } from '../convex/_generated/api';

// Load every convex module so convex-test can resolve function references.
const modules = import.meta.glob('../convex/**/*.ts');

describe('users.source ghi lúc tạo user (UTM)', () => {
  it('ghi source + firstSeenAt cho user MỚI khi đăng ký có UTM', async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.auth.createOrUpdateUser, {
      email: 'new-user@example.com',
      fullName: 'Người Mới',
      agreeToTerms: true,
      source: 'tiktok:social',
    });

    const user = await t.run(async (ctx) =>
      ctx.db.query('users').withIndex('by_email', (q) => q.eq('email', 'new-user@example.com')).first()
    );

    expect(user?.source).toBe('tiktok:social');
    expect(typeof user?.firstSeenAt).toBe('number');
    expect(user?.firstSeenAt).toBeGreaterThan(0);
  });

  it('KHÔNG ghi đè source của user cũ khi họ quay lại với UTM khác', async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.auth.createOrUpdateUser, {
      email: 'returning@example.com',
      fullName: 'Quay Lại',
      agreeToTerms: true,
      source: 'youtube:shorts',
    });

    const first = await t.run(async (ctx) =>
      ctx.db.query('users').withIndex('by_email', (q) => q.eq('email', 'returning@example.com')).first()
    );
    const firstSeenAt = first?.firstSeenAt;

    // Lần đăng nhập/đăng ký thứ 2 với nguồn khác
    await t.mutation(api.auth.createOrUpdateUser, {
      email: 'returning@example.com',
      fullName: 'Quay Lại Lần 2',
      agreeToTerms: true,
      source: 'facebook:reels',
    });

    const second = await t.run(async (ctx) =>
      ctx.db.query('users').withIndex('by_email', (q) => q.eq('email', 'returning@example.com')).first()
    );

    expect(second?.source).toBe('youtube:shorts'); // giữ nguồn lần đầu
    expect(second?.firstSeenAt).toBe(firstSeenAt); // không đổi mốc lần đầu
  });

  it('user đăng ký KHÔNG có UTM → source undefined', async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.auth.createOrUpdateUser, {
      email: 'direct@example.com',
      fullName: 'Direct',
      agreeToTerms: true,
    });

    const user = await t.run(async (ctx) =>
      ctx.db.query('users').withIndex('by_email', (q) => q.eq('email', 'direct@example.com')).first()
    );

    expect(user?.source).toBeUndefined();
  });
});

type SourceCount = { source: string; count: number };
const asMap = (arr: SourceCount[]) => Object.fromEntries(arr.map((r) => [r.source, r.count]));

describe('4 query báo cáo theo nguồn (số thật từ Convex)', () => {
  it('getSourceReport đếm đăng ký / hoạt động / mua / quay lại theo source', async () => {
    const t = convexTest(schema, modules);
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    // 2 user tiktok, 1 user youtube
    await t.run(async (ctx) => {
      const tiktok1 = await ctx.db.insert('users', {
        email: 'tk1@example.com', fullName: 'TK1', role: 'student',
        source: 'tiktok', firstSeenAt: now - 20 * day, createdAt: now - 20 * day,
      });
      const tiktok2 = await ctx.db.insert('users', {
        email: 'tk2@example.com', fullName: 'TK2', role: 'student',
        source: 'tiktok', firstSeenAt: now - 3 * day, createdAt: now - 3 * day,
      });
      const yt = await ctx.db.insert('users', {
        email: 'yt@example.com', fullName: 'YT', role: 'student',
        source: 'youtube', firstSeenAt: now - 10 * day, createdAt: now - 10 * day,
      });

      const course = await ctx.db.insert('courses', {
        slug: 'c1', title: 'C1', subtitle: '', description: '', badge: '',
        isFree: false, teacherId: 't', totalVideos: 10, published: true,
        createdAt: now, updatedAt: now,
      });

      // Hoạt động: tk1 xem gần đây, tk2 xem gần đây, yt không xem
      await ctx.db.insert('userCourseProgress', {
        userId: tiktok1, courseId: course, completedLectures: 1, totalLectures: 10,
        lastWatchedAt: now - day, lastUpdated: now,
      });
      await ctx.db.insert('userCourseProgress', {
        userId: tiktok2, courseId: course, completedLectures: 2, totalLectures: 10,
        lastWatchedAt: now - 2 * day, lastUpdated: now,
      });

      // Mua active: 1 tiktok, 1 youtube
      await ctx.db.insert('purchases', {
        userId: tiktok1, courseId: 'c1', provider: 'payos', amount: 399000,
        currency: 'VND', status: 'active', createdAt: now - day,
      });
      await ctx.db.insert('purchases', {
        userId: yt, courseId: 'c1', provider: 'payos', amount: 399000,
        currency: 'VND', status: 'active', createdAt: now - day,
      });
      // Mua pending — không tính
      await ctx.db.insert('purchases', {
        userId: tiktok2, courseId: 'c1', provider: 'payos', amount: 399000,
        currency: 'VND', status: 'pending', createdAt: now - day,
      });
    });

    const report = await t.query(api.dashboard.getSourceReport, {});

    const reg = asMap(report.registrations as SourceCount[]);
    expect(reg.tiktok).toBe(2);
    expect(reg.youtube).toBe(1);

    const act = asMap(report.activity as SourceCount[]);
    expect(act.tiktok).toBe(2); // tk1 + tk2 có lastWatchedAt trong kỳ

    const pur = asMap(report.purchases as SourceCount[]);
    expect(pur.tiktok).toBe(1);
    expect(pur.youtube).toBe(1);

    // tk1 firstSeenAt = now-20d, lastWatchedAt = now-1d → >= +7d → quay lại
    const ret = asMap(report.returning as SourceCount[]);
    expect(ret.tiktok).toBe(1);

    expect(report.totalRegistrations).toBe(3);
  });

  it('4 query rời trả cùng số như getSourceReport (registrationsBySource, activityBySource, purchasesBySource, returningBySource)', async () => {
    const t = convexTest(schema, modules);
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    await t.run(async (ctx) => {
      const u = await ctx.db.insert('users', {
        email: 'tk@example.com', fullName: 'TK', role: 'student',
        source: 'tiktok', firstSeenAt: now - 30 * day, createdAt: now - 30 * day,
      });
      const course = await ctx.db.insert('courses', {
        slug: 'c1', title: 'C1', subtitle: '', description: '', badge: '',
        isFree: false, teacherId: 't', totalVideos: 10, published: true,
        createdAt: now, updatedAt: now,
      });
      await ctx.db.insert('userCourseProgress', {
        userId: u, courseId: course, completedLectures: 1, totalLectures: 10,
        lastWatchedAt: now - day, lastUpdated: now,
      });
      await ctx.db.insert('purchases', {
        userId: u, courseId: 'c1', provider: 'payos', amount: 399000,
        currency: 'VND', status: 'active', createdAt: now - day,
      });
    });

    const registrations = await t.query(api.dashboard.registrationsBySource, {});
    const activity = await t.query(api.dashboard.activityBySource, {});
    const purchases = await t.query(api.dashboard.purchasesBySource, {});
    const returning = await t.query(api.dashboard.returningBySource, {});

    expect(asMap(registrations as SourceCount[]).tiktok).toBe(1);
    expect(asMap(activity as SourceCount[]).tiktok).toBe(1);
    expect(asMap(purchases as SourceCount[]).tiktok).toBe(1);
    expect(asMap(returning as SourceCount[]).tiktok).toBe(1);
  });

  it('lọc theo khoảng thời gian (fromTs/toTs)', async () => {
    const t = convexTest(schema, modules);
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    await t.run(async (ctx) => {
      await ctx.db.insert('users', {
        email: 'old@example.com', fullName: 'Old', role: 'student',
        source: 'google', firstSeenAt: now - 40 * day, createdAt: now - 40 * day,
      });
      await ctx.db.insert('users', {
        email: 'new@example.com', fullName: 'New', role: 'student',
        source: 'google', firstSeenAt: now - 2 * day, createdAt: now - 2 * day,
      });
    });

    const report = await t.query(api.dashboard.getSourceReport, {
      fromTs: now - 7 * day,
      toTs: now,
    });

    const reg = asMap(report.registrations as SourceCount[]);
    expect(reg.google).toBe(1); // chỉ user mới trong 7 ngày
    expect(report.totalRegistrations).toBe(1);
  });
});
