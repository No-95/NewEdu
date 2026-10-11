# Vòng đo lường — Luồng B HDP EDU
## Nguồn → Đăng ký → Hoạt động → Mua → Quay lại

Cập nhật: 2026-10-05 · Tác giả: GrowthContent · Task: [HDPAAA-4](/HDPAAA/issues/HDPAAA-4)

> Số liệu báo cáo **lấy từ Convex (số thật)**. Không dùng số marketing chưa kiểm chứng.

---

### 1. Định nghĩa 5 bước

| Bước | Sự kiện | Bảng/field Convex (đã đối chiếu `convex/schema.ts`) |
|---|---|---|
| **Nguồn** | Người đến từ kênh nào | `users.source` — **CHƯA CÓ, cần thêm** (xem §3) |
| **Đăng ký** | Tạo tài khoản | `users` — `auth.ts` → `createUser` `ctx.db.insert('users', {...})` (dòng ~178) |
| **Hoạt động** | Xem bài học | `userCourseProgress` — có `lastWatchedAt`, `completedLectures`, index `by_userId`, `by_user_course` |
| **Mua hàng** | Trả tiền | `purchases` — `status: pending|active|failed`, index `by_user_course`, `by_course_user` |
| **Quay lại** | Xem lại sau 7/14/30 ngày | `userCourseProgress.lastWatchedAt` |

### 2. Đo theo kênh (UTM)

| Kênh | Tham số UTM | Ghi vào |
|---|---|---|
| TikTok | `utm_source=tiktok&utm_medium=social` | `users.source = "tiktok"` |
| YouTube Shorts | `utm_source=youtube&utm_medium=shorts` | `users.source = "youtube"` |
| Facebook Reels | `utm_source=facebook&utm_medium=reels` | `users.source = "facebook"` |
| SEO | `utm_source=google&utm_medium=organic` | `users.source = "google"` + Search Console |
| Cộng đồng | `utm_source=community&utm_medium=<nhom>` | `users.source = "community:<nhom>"` |
| Đối tác | `utm_source=partner&utm_medium=<ma-doi-tac>` | `users.source = "partner:<ma>"` |

Quy ước giá trị `source`: chữ thường, dạng `kênh` hoặc `kênh:chi-tiết`.

### 3. Thay đổi chính xác cần kỹ sư nền tảng làm

**B1. Thêm 2 field vào bảng `users`** (`convex/schema.ts`, dòng 5–29):
```ts
source: v.optional(v.string()),        // "tiktok" | "youtube" | "facebook" | "google" | "community:<nhom>" | "partner:<ma>"
firstSeenAt: v.optional(v.number()),   // ms, set 1 lần lúc tạo user
```
Thêm index: `.index('by_source', ['source'])`

**B2. Ghi `source` lúc tạo user** (`convex/auth.ts`, hàm `createUser`, dòng ~150–195):
- Nhận thêm arg `source: v.optional(v.string())`.
- Ở nhánh tạo mới (dòng ~178), thêm `source: args.source, firstSeenAt: now`.
- Không ghi đè `source` của user cũ (nhánh `existing`, dòng ~166) — nguồn tính theo lần đầu.

**B3. Frontend truyền UTM** (`middleware.ts` hoặc form đăng ký):
- Đọc `utm_source`/`utm_medium` từ URL → lưu cookie `hdp_src` (30 ngày).
- Khi gọi `createUser`, gửi `source = utm_source + (utm_medium ? ":" + utm_medium : "")`.

**B4. Query báo cáo** (`convex/dashboard.ts`) — 4 query mới:
1. `registrationsBySource(fromTs, toTs)` → `users` group theo `source`, đếm `createdAt` trong khoảng.
2. `activityBySource(fromTs, toTs)` → join `userCourseProgress` ↔ `users.source`, đếm user có `lastWatchedAt` trong khoảng.
3. `purchasesBySource(fromTs, toTs)` → join `purchases` (status `active`) ↔ `users.source`.
4. `returningBySource(fromTs, toTs)` → đếm user có `lastWatchedAt` ≥ 7 ngày sau `firstSeenAt`.

**B5. SEO** (HDPAAA-3): thêm `robots.txt` + `sitemap.xml` (xem `offer-cta-landing.md` §SEO).

### 4. Báo cáo hàng tuần (template)

```
## Báo cáo tuần N — HDP EDU Luồng B

| Nguồn | Đăng ký mới | Hoạt động | Mua | Quay lại (7 ngày) |
|---|---|---|---|---|
| TikTok | ... | ... | ... | ... |
| YouTube Shorts | ... | ... | ... | ... |
| Facebook Reels | ... | ... | ... | ... |
| Google (SEO) | ... | ... | ... | ... |
| Cộng đồng | ... | ... | ... | ... |
| Đối tác | ... | ... | ... | ... |
| **Tổng** | **...** | **...** | **...** | **...** |

Số liệu lấy từ Convex (4 query ở §3.B4), không ước lượng.
```

### 5. Ngưỡng báo động

- Tuần 1–2: < 10 đăng ký/tuần → tăng nhịp post, thử kênh mới.
- Tuần 3–4: > 30 đăng ký nhưng < 5 hoạt động → sai offer/landing, sửa CTA.
- Tuần 5+: > 30 hoạt động + > 5 mua → duy trì nhịp.

### 6. Ghi chú

- Nguồn tính theo **lần đầu** (`firstSeenAt`), không ghi đè khi user quay lại.
- Số đăng ký thật hiện tại = 0 (chưa có user thật) → mọi báo cáo phải ghi 0, không bịa.
