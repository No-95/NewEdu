# Báo cáo kế hoạch 90 ngày & lộ trình thương mại hóa HDP EDU — bản v4

**Ngày:** 2026-10-11 · **Tác giả:** CEO · **Issue:** HDP-2 · **Mốc so sánh:** báo cáo 3 ngày (2026-10-06)

**Cách đọc số trong báo cáo này:**
- **[THỰC TẾ]** — kiểm chứng được. Có nguồn và cách đo.
- **[MỤC TIÊU]** — con số dự kiến, cần bạn duyệt. Không phải dự báo.
- **[CHƯA CÓ DỮ LIỆU]** — chưa có số. Ghi rõ và đề xuất cách lấy.

Không có số liệu tự bịa.

---

## 0. Sửa lỗi so với v3

Bản v3 nói sai 4 điểm. Bản v4 sửa, có bằng chứng mới.

| # | V3 nói | Sự thật (đo 2026-10-11) | Cách đo |
|---|---|---|---|
| 1 | "Prod chạy build **CŨ HƠN cả file nguồn**" | **Sai một nửa.** Prod chạy build **MỚI HƠN** repo local 1 commit — chính là commit GA4 của bạn (`c8cbab9`, 2026-10-11 16:38 UTC) đã đẩy lên GitHub | So `<title>` prod với `app/layout.tsx` của `origin/main` và của local |
| 2 | `/offer/combo` "đã bị gỡ khỏi source", "cần dựng lại" | **Sai.** Combo 499.000đ **chưa bao giờ có trong source**. `app/offer/` chưa từng tồn tại. Số 499.000đ không có ở đâu trong `app/`, `lib/`, `components/`, `convex/` | `git log --all -- 'app/offer*'` trống; `git grep "499"` rỗng |
| 3 | `/free-lessons`, `/blog` "bị gỡ" | **Sai.** Hai route này **chưa bao giờ tồn tại**. Chúng chỉ là redirect trong `next.config.mjs`; redirect đó bị xoá ở commit local `78c402c` | `git log --all -- 'app/blog*' 'app/free-lessons*'` trống |
| 4 | "Phải `git add` PDF trước khi build, nếu không PDF không vào bundle" | **Sai.** Build local chạy từ **working tree**, không phải từ Git. PDF **có** trong bundle: `.open-next/assets/lead-magnet-50-cum-tu.pdf` (3.732 B) | `ls -la .open-next/assets/` sau khi build |

Giữ nguyên 5 sửa lỗi của v3 (đo bằng Playwright, về khoá học / GA4 / `/experts` / blog) — xem bản v3 để đối chiếu.

---

## 0b. Nguyên nhân gốc — đã kiểm chứng, không còn đoán

### Có hai lịch sử Git tách rời

| Nhánh | HEAD | Nội dung | Trạng thái |
|---|---|---|---|
| `origin/main` (GitHub) | `c8cbab9` | "add Google Analytics gtag.js (G-E5DZZJLMBX) to root layout" — **bạn commit 2026-10-11 16:38 UTC**, chỉ sửa `app/layout.tsx` | **Đây là bản prod đang chạy** |
| `main` (máy này) | `78c402c` | 4 commit SEO của tôi (2026-10-08): metadata từng route, `public/sitemap.xml`, sửa `robots.txt`, redirect `/offer/*` | **Chưa từng đẩy lên GitHub** |

Cả hai cùng tách ra từ `64cb2c6` (2026-06-26). Chúng **xung đột** ở `app/layout.tsx` (`git merge-tree` → CONFLICT).

**Bằng chứng prod đang chạy `c8cbab9`:** prod trả `<title>HDP EDU - Learn Korean Anywhere</title>`, mô tả tiếng Anh "Master Korean language with AI-powered learning", `gtag('config','G-E5DZZJLMBX')` không có `send_page_view`. Đó đúng là `app/layout.tsx` của `origin/main` — và ngược hẳn với local (tiêu đề tiếng Việt, có `send_page_view: true`).

### Vì sao 5 đường dẫn 404 — giải thích đúng

| Đường dẫn | Lý do thật |
|---|---|
| `/robots.txt`, `/sitemap.xml`, `/lead-magnet-50-cum-tu.pdf` | Ba file này **chỉ có trong 4 commit local chưa đẩy**. `origin/main` không có chúng (`git cat-file -e origin/main:public/robots.txt` → không tồn tại). Prod build từ `origin/main` nên đương nhiên 404 |
| `/free-lessons`, `/blog` | **Chưa bao giờ là route.** Không phải mất, mà là chưa làm |
| `/offer/combo` | **Chưa bao giờ là trang.** Chỉ có redirect (thêm ở commit local `78c402c`, chưa lên prod) |

### Rủi ro MỚI — repo không tái tạo được từ Git

`HEAD` **không build được từ bản clone sạch**. Lý do: file được import nhưng **không nằm trong Git**:

| File bị thiếu trong Git | Ai cần nó |
|---|---|
| `components/GA4Tracker.tsx` | `app/layout.tsx` (dòng 10, 141) + 3 component khoá học |
| `app/contact/page.tsx`, `app/api/contact/route.ts` | Route `/contact` + `/api/contact` |
| `convex/leadCapture.ts` | `app/api/leads/capture/route.ts` |
| `lib/data/korean-vocab.json` | `lib/tests/curated-seed.ts` |

Còn 22 file đã sửa nhưng **chưa commit** (`git status` → ` M`), gồm `middleware.ts`, `convex/schema.ts`, `lib/data/courses.ts`.

**Phạm vi ảnh hưởng — chính xác:**
- **Build local trên máy này: KHÔNG bị ảnh hưởng.** `pnpm run build:cloudflare` build từ working tree, nên vẫn thấy mọi file. Tôi đã chạy thật, exit 0.
- **Build từ clone sạch / CI: BỊ ảnh hưởng.** Workflow `.github/workflows/deploy-cloudflare.yml` checkout từ Git → thiếu file → build fail.

Vậy đường deploy local không cần `git add`. `git add` chỉ cần cho đường GitHub/CI.

### Rủi ro MỚI thứ hai — GA4 sẽ TẮT nếu deploy local

- Local `app/layout.tsx` đọc `process.env.NEXT_PUBLIC_GA4_ID`.
- Biến này **không được đặt ở đâu cả**: `.env.production` (đã commit) chỉ có 3 biến, không có GA4; workflow CI cũng không set.
- Kết quả đo: build **không có env** → `grep -rl "E5DZZJLMBX" .open-next/` **rỗng** (GA4 biến mất). Build **có env** `NEXT_PUBLIC_GA4_ID=G-E5DZZJLMBX` → GA4 có trong 23 file.

Nghĩa là: deploy local HEAD nguyên trạng = **mất GA4** mà bạn vừa cài. Phải chọn cách hoà giải (xem §6, câu 3).

### Bằng chứng build đã chạy thật

Tôi đã chạy `pnpm run build:cloudflare` 2 lần trên máy này. Cả hai **exit 0**. Bản mới nhất (có GA4):

| Hạng mục | Kết quả |
|---|---|
| `BUILD_ID` | `8VWpaRsjMv6pfvhQVFMOc` |
| `robots.txt` | 413 B — bản mới, không còn `/blog`, `/free-lessons` |
| `sitemap.xml` | 2.024 B — **15 URL** |
| `lead-magnet-50-cum-tu.pdf` | 3.732 B — có trong bundle |
| GA4 | có trong 23 file của bundle |
| Redirect trong `routes-manifest.json` | `/offer/combo → /books` (308), `/offer/course-399k → /courses/cam-nang-video-tieng-han-san-xuat` (308) |
| Tổng route tĩnh | 42 — có `/contact`, `/contact-us`, `/career`, `/business`, `/experts`, `/preview` |
| Tiêu đề | "HDP EDU — Tiếng Hàn Sản Xuất cho Người Việt" (bản tiếng Việt đúng) |

Vậy bundle **đã sẵn sàng**. Chỉ còn thiếu quyền Cloudflare để đẩy lên.

---

## 1. Đánh giá hiện trạng và điểm nghẽn lớn nhất

### 1.1 Hiện trạng hệ thống (đo 2026-10-11)

| Hạng mục | Trạng thái | Bằng chứng |
|---|---|---|
| Tech stack | Next.js 15.5.6 + Convex + Cloudflare Workers (OpenNext) | `package.json`, `wrangler.jsonc` |
| Khoá học | Đã publish: 1 khoá · 72 bài · 15 unit, có nút mua | Playwright đọc DOM sau `networkidle` (đo ở bản v3) |
| Khoá sản xuất | 399.000₫ · video HLS trên Cloudflare R2 | Playwright (bản v3) |
| Sách đang bán | 225.000đ (gốc 250.000đ), trang ghi "còn 74 bản" | Trang `/books` |
| Combo 499.000đ | **Chưa tồn tại trong source** | `git log --all`, `git grep "499"` |
| GA4 | Đang chạy `G-E5DZZJLMBX` — nhưng từ commit `origin/main`, không từ local | HTML prod |
| Đo lường theo kênh | `users.source`, `users.firstSeenAt`, index `by_source`, 4 query dashboard | `convex/schema.ts`, `convex/auth.ts`, `convex/dashboard.ts` |
| Fanpage Facebook | Đã có: "Tiếng Hàn Chuyên Ngành HDP" | `kenh-thiet-lap.md` |
| Messenger auto | Chạy 08:00–21:30 mỗi giờ | `~/workspace/hdpedu-messenger-auto` |
| Nội dung sẵn sàng | 10 bài đăng + lịch 60 ngày + 8 định dạng (đều là **bản nháp**) | `draft-posts/` |
| Số liệu thật | Lead 0 · đăng ký 0 · mua 0 · bài đăng thật 0 | Báo cáo 3 ngày 2026-10-06 |
| Quyền deploy | `wrangler` **chưa đăng nhập**. Không có `CLOUDFLARE_API_TOKEN` trong env | `npx wrangler whoami` |
| Quyền push GitHub | `git ls-remote` OK (repo công khai). `git push` **thiếu credential** | `git push --dry-run` |
| Repo tái tạo được? | **Không.** 22 file sửa chưa commit + 4 file import chưa vào Git | `git status`, `git archive HEAD` |

### 1.2 Điểm nghẽn

**P0 — chặn doanh thu, sửa được ngay:**

| # | Nghẽn | Bằng chứng | Hệ quả |
|---|---|---|---|
| N1 | **Repo local và `origin/main` tách rời, xung đột `app/layout.tsx`** | `git merge-tree` → CONFLICT; `origin/main` = `c8cbab9`, local = `78c402c` | 4 commit SEO không lên được prod; prod và local khác nhau về tiêu đề/mô tả |
| N2 | **`robots.txt` + `sitemap.xml` 404 trên prod** | curl 3 lần, có `no-cache` vẫn 404 | Google không thấy sitemap → mất traffic SEO (kênh miễn phí chính) |
| N3 | **Lead magnet PDF 404** | curl → 404; file có trong bundle mới | Phễu thu lead "50 cụm từ" đứt |
| N4 | **Repo không tái tạo được từ Git** — 22 file sửa chưa commit + 4 file import chưa vào Git | `git archive HEAD` không có `GA4Tracker.tsx`; `git show HEAD:app/layout.tsx` vẫn import nó | Đường GitHub/CI không build được. Đường deploy local **không** bị ảnh hưởng |
| N5 | **GA4 sẽ tắt nếu deploy local** — `NEXT_PUBLIC_GA4_ID` chưa đặt ở đâu | build không env → GA4 rỗng trong `.open-next/` | Mất đo lường bạn vừa cài |

**P1 — chặn tăng trưởng:**

| # | Nghẽn | Bằng chứng |
|---|---|---|
| N6 | `/free-lessons` và `/blog` 404 — **chưa bao giờ là route** | `git log --all -- 'app/blog*' 'app/free-lessons*'` trống |
| N7 | `/offer/combo` 404 — **trang combo chưa từng tồn tại**, phải dựng mới | `app/offer/` không có; không có "499" trong source |
| N8 | Chưa có traffic thật: lead 0, đăng ký 0, mua 0 | Báo cáo 3 ngày 2026-10-06 |
| N9 | Chưa có quyền đăng kênh (TikTok, YouTube, Reels) | `kenh-thiet-lap.md` |
| N10 | Không có social proof — 0 testimonial | Chưa thu thập |
| N11 | Khoá "Tiếng Hàn hành chính văn phòng" **không có trong hệ thống** | `lib/data/courses.ts`, `convex/courses.ts` chỉ có 1 khoá sản xuất |

**P2 — dài hạn:**

| # | Nghẽn | Bằng chứng |
|---|---|---|
| N12 | `/contact` 404 (đúng ra là `/contact-us` 200); `/career`, `/business` 404 trên prod. Bản build mới **đã có** cả 3 route | Quét 27 route prod + `routes-manifest.json` bản mới |
| N13 | Đội chỉ có 1 agent (CEO) | `GET /companies/.../agents` |
| N14 | Chưa có cộng đồng, chưa có đối tác ký kết, chưa có quy trình B2B | — |

### 1.3 Rủi ro lớn nhất

| Rủi ro | Vì sao đáng lo | Cách chặn |
|---|---|---|
| Hai nhánh Git tách rời (N1) | Mọi việc sửa trong repo không tới được khách. Đây là rủi ro gốc của N2–N5, N12 | Hợp nhất `origin/main` ↔ local, đẩy lên, deploy lại |
| Repo không tái tạo được (N4) | Không ai clone về build được. Mất khả năng khôi phục | Commit trạng thái working tree (cần bạn quyết — §6 câu 4) |
| Deploy local nguyên trạng (N5) | GA4 tắt | Quyết cách cấu hình GA4 trước khi deploy (§6 câu 3) |
| Xung đột `app/layout.tsx` | Ghi đè lẫn nhau giữa bản GA4 của bạn và bản SEO tiếng Việt của tôi | Hợp nhất thủ công 1 lần, chọn bản giữ |
| Tồn kho sách 74 bản | Vốn chôn trong hàng | Đẩy bán, mục tiêu hết trong 60 ngày |
| Con số "74 bản" chưa xác minh | Có thể là số tạo khan hiếm | Bạn xác nhận tồn kho thật |
| Số marketing cũ (50K+ cộng đồng, 10K+ học viên) | Đã gỡ khỏi code; nếu còn chỗ khác thì mất niềm tin | Rà toàn bộ trang trước khi chạy quảng cáo |
| Chủ sở hữu chậm cấp quyền | Chậm cả giai đoạn 1 | Làm trước phần không cần quyền (đã làm: build xong, bundle sẵn sàng) |

---

## 2. Bản đồ hệ sinh thái và mô hình doanh thu

### 2.1 Bản đồ hệ sinh thái (5 lớp)

```
Lớp 5 — HỆ SINH THÁI B2B
        Đào tạo doanh nghiệp · Tuyển dụng · Marketplace chuyên gia
                    ▲
Lớp 4 — CỘNG ĐỒNG
        Nhóm người học · Hỏi đáp · Sự kiện · Giới thiệu bạn bè
                    ▲
Lớp 3 — DỮ LIỆU
        Lead (email/SĐT) → Tài khoản → Tiến độ học → Mua → Quay lại
                    ▲
Lớp 2 — KÊNH PHÂN PHỐI
        SEO/website · Fanpage + Reels · Messenger auto · (sau) TikTok, YouTube · Cộng đồng · Đối tác
                    ▲
Lớp 1 — SẢN PHẨM
        Sách 225k · Khoá video 399k · (cần dựng) Combo 499k · (sau) Khoá văn phòng, lớp trực tiếp, coaching
```

Logic: lớp 1 tạo tiền ngay. Lớp 2 đưa người vào. Lớp 3 giữ dữ liệu. Lớp 4 giữ người. Lớp 5 bán giá cao. Không nhảy lớp.

### 2.2 Mô hình doanh thu

| Tầng | Sản phẩm | Giá | Vai trò | Hiện trạng |
|---|---|---|---|---|
| Free | Blog, social, cộng đồng, PDF "50 cụm từ" | 0đ | Kéo traffic + thu lead | Nội dung có sẵn, **đang đứt trên prod** (N2–N4) |
| Tripwire | Sách in "Tiếng Hàn Sản xuất" | 225.000đ | Chuyển đổi đầu, tạo tin tưởng | Đang bán, tồn 74/250 bản [THỰC TẾ] |
| Core | Khoá video "Cẩm nang Tiếng Hàn Sản xuất" | 399.000đ | Doanh thu chính | Đã publish, mua được [THỰC TẾ] |
| Bundle | Combo sách + khoá | 499.000đ | Tăng giá trị đơn | **Chưa có trang, chưa có giá trong code — phải dựng mới** (N7) |
| Mở rộng (sau) | Khoá văn phòng, lớp trực tiếp, coaching, B2B | [CHƯA CÓ DỮ LIỆU] | Tăng doanh thu trên mỗi khách | Cần bằng chứng nhu cầu trước |

### 2.3 Chi phí — [CHƯA CÓ DỮ LIỆU]

Cần 4 số này để tính lợi nhuận đóng góp (hiện chỉ tính được doanh thu):

1. Giá vốn in sách, mỗi bản.
2. Chi phí đã đầu tư cho 72 video.
3. Phí Cloudflare (Workers, R2) và Convex hằng tháng.
4. Phí cổng thanh toán và phí vận chuyển.

### 2.4 Dự kiến doanh thu 90 ngày

| Tháng | Lead [MỤC TIÊU] | Đăng ký [MỤC TIÊU] | Mua [MỤC TIÊU] | Doanh thu [MỤC TIÊU] |
|---|---|---|---|---|
| T1 (ngày 1–30) | 30 | 10 | 0 | 0đ |
| T2 (ngày 31–60) | 100 | 40 | 5 | 1.125.000đ |
| T3 (ngày 61–90) | 300 | 120 | 20 | 10.000.000đ |

Căn cứ đề xuất: tồn kho 74 bản sách, fanpage đã có, 60 bài nội dung đã soạn sẵn, khoá học đã publish mua được. Đây là giả định để bạn duyệt, không phải dự báo.

---

## 3. Kế hoạch hành động 90 ngày

### Giai đoạn 1 (ngày 1–30): Nền tảng — sửa prod, mở kênh

| # | Ưu tiên | Hành động | Output | Deadline |
|---|---|---|---|---|
| 1 | P0 | **Quyết định cách cấu hình GA4** (xem §6 câu 3) | GA4 còn chạy sau deploy | Ngày 1 |
| 2 | P0 | **Hợp nhất `origin/main` ↔ local** (xung đột `app/layout.tsx`) — chọn bản giữ | 1 nhánh thống nhất, không xung đột | Ngày 1 |
| 3 | P0 | **Deploy lên prod** (cần quyền Cloudflare) | `BUILD_ID` prod khớp repo | Ngày 2 |
| 4 | P0 | Kiểm chứng `robots.txt`, `sitemap.xml`, PDF trả 200 | 3 đường dẫn trả 200 | Ngày 3 |
| 5 | P0 | Dựng trang combo 499.000đ (mới, không phải khôi phục) | `/offer/combo` là trang thật, mua được | Ngày 5 |
| 6 | P0 | Xin quyền đăng kênh (TikTok, YouTube, Page role) | Đăng được 1 bài thật | Ngày 7 |
| 7 | P1 | Commit trạng thái working tree + đẩy lên GitHub (cần bạn quyết — §6 câu 4) | Clone sạch build được; CI chạy được | Ngày 7 |
| 8 | P1 | Đăng 10 bài social theo lịch có sẵn | 10/10 bài lên kênh, mỗi bài có UTM | Ngày 14 |
| 9 | P1 | Gửi sitemap lên Google Search Console | Search Console nhận sitemap | Ngày 10 |
| 10 | P1 | Kiểm tra nút mua sách + tồn kho hiển thị đúng | Đặt hàng thử thành công | Ngày 12 |
| 11 | P2 | Tối ưu landing (hero, CTA, chỗ để social proof) | Landing rõ sản phẩm + giá + UTM | Ngày 21 |
| 12 | P2 | Email tự động trả lời + gửi PDF | Form submit → nhận PDF + chuỗi email | Ngày 28 |

### Giai đoạn 2 (ngày 31–60): Tối ưu và thu dữ liệu

| # | Ưu tiên | Hành động | Output | Deadline |
|---|---|---|---|---|
| 13 | P0 | Đọc GA4 + UTM, xác định kênh traffic chính | Báo cáo tuần: nguồn → lead | Ngày 37 |
| 14 | P0 | Tối ưu landing theo dữ liệu | Tỷ lệ lead/truy cập tăng | Ngày 44 |
| 15 | P1 | Thử retargeting Facebook (audience từ lead) | 1 chiến dịch chạy | Ngày 51 |
| 16 | P1 | Thu 5 testimonial từ lead đầu | 5 review có tên/ảnh | Ngày 58 |
| 17 | P1 | Viết 20 bài blog SEO | 20 bài publish | Ngày 60 |
| 18 | P0 | Bán nốt tồn kho sách | Hết tồn hoặc còn dưới 20 bản | Ngày 60 |

### Giai đoạn 3 (ngày 61–90): Mở rộng có bằng chứng

| # | Ưu tiên | Hành động | Output | Deadline |
|---|---|---|---|---|
| 19 | P0 | Chuyển đổi sách đầu tiên từ lead | ≥5 đơn sách | Ngày 67 |
| 20 | P0 | Xây social proof | 10+ testimonial thật | Ngày 74 |
| 21 | P1 | Tối ưu SEO on-page, backlink, sitemap | 50 từ khoá vào top 100 Google | Ngày 81 |
| 22 | P1 | Mở 2 kênh mới (Zalo, LinkedIn hoặc nhóm) | 2 kênh hoạt động | Ngày 88 |
| 23 | P2 | Khảo sát nhu cầu khoá văn phòng (20 phỏng vấn) | ≥10 người xác nhận sẽ trả tiền | Ngày 75 |
| 24 | P2 | Danh sách 20 doanh nghiệp Hàn mục tiêu B2B | Có danh sách + 5 cuộc gọi | Ngày 80 |
| 25 | P2 | Quyết định mở rộng hay dừng | Báo cáo quyết định kèm số thật | Ngày 90 |

**Ngân sách 90 ngày: giữ ở mức thấp nhất.**

- Đang có, đã trả: Cloudflare Workers/R2 (free tier), Convex (free tier), GA4 (miễn phí), tên miền (~200.000đ/năm), Canva (free tier), email (free tier).
- Chi mới đề xuất: **1.000.000đ**, chỉ mở ở tháng 2 và chỉ khi đã có ≥100 lead. Dùng thử 1 kênh quảng cáo nhỏ.
- Trước khi có ≥100 lead: **không chi quảng cáo**. Dùng kênh miễn phí: SEO, fanpage, messenger, cộng đồng.

---

## 4. KPI, ngân sách, nguồn lực

### 4.1 Bảng KPI

Cột "hiện trạng" là số thật, đo 2026-10-11. Cột mục tiêu là đề xuất của tôi, **cần bạn duyệt**.

| # | Chỉ số | Hiện trạng | Mục tiêu 30 ngày | Mục tiêu 60 ngày | Mục tiêu 90 ngày | Nguồn đo |
|---|---|---|---|---|---|---|
| 1 | Traffic tháng | 0 [THỰC TẾ] | 100 [MỤC TIÊU] | 500 | 2.000 | GA4 `G-E5DZZJLMBX` |
| 2 | Lead (form submit) | 0 [THỰC TẾ] | 30 | 100 | 300 | Convex `contactSubmissions` |
| 3 | Email subscriber | 0 [THỰC TẾ] | 30 | 100 | 300 | Convex `leadCapture` |
| 4 | Đăng ký tài khoản | 0 [THỰC TẾ] | 10 | 40 | 120 | Convex `users` |
| 5 | Người học hoạt động | 0 [THỰC TẾ] | 5 | 20 | 80 | `userCourseProgress` |
| 6 | Đơn sách | 0 [THỰC TẾ] | 0 | 20 | 74 | Đơn hàng |
| 7 | Đơn khoá | 0 [THỰC TẾ] | 0 | 5 | 20 | Convex `purchases` |
| 8 | Doanh thu | 0đ [THỰC TẾ] | 0đ | 1.125.000đ | 10.000.000đ | Convex `purchases` |
| 9 | Bài đăng social | 0 [THỰC TẾ] | 10 | 30 | 60 | Kênh + UTM |
| 10 | Bài blog | 0 [THỰC TẾ] | 8 | 15 | 25 | `/blog` |
| 11 | Testimonial | 0 [THỰC TẾ] | 3 | 10 | 20 | Thu thập |
| 12 | Tỷ lệ mua lại | [CHƯA CÓ DỮ LIỆU] | — | — | 10% [MỤC TIÊU] | `purchases` |
| 13 | Khách doanh nghiệp | 0 [THỰC TẾ] | 0 | 0 | 2 [MỤC TIÊU] | Hợp đồng |
| 14 | Tiến độ task của agent | 0% | 80% | 80% | 80% | Paperclip |

Ghi chú: chỉ số 10 (bài blog) hiện trạng là **0** — chưa bao giờ có route `/blog` (N6).

### 4.2 Ngân sách

| Khoản | Số tiền | Điều kiện mở |
|---|---|---|
| Vận hành (Cloudflare, Convex, tên miền, email) | ~200.000đ/năm (đã trả) | — |
| Thử kênh quảng cáo | 1.000.000đ | Chỉ khi ≥100 lead |
| **Tổng chi mới** | **1.000.000đ** | — |

### 4.3 Nguồn lực

| Nguồn | Số lượng | Vai trò |
|---|---|---|
| AI Agent (CEO) | 1 | Hiện làm tất cả: kỹ thuật, nội dung, marketing, QA |
| Chủ sở hữu | 1 | Phê duyệt, cấp quyền (Cloudflare, GitHub, kênh social) |

Đề xuất tuyển 5 vai khi bạn cho phép: GrowthContent, Sales, Community, PlatformEngineer, DataOps. **Tôi chưa tuyển.**

---

## 5. Danh sách task cần giao cho từng AI Agent

Hiện công ty chỉ có 1 agent (CEO). Danh sách này là đề xuất để bạn duyệt.

| # | Task | Agent đề xuất | Deadline | Tiêu chí nghiệm thu | Chặn bởi |
|---|---|---|---|---|---|
| T1 | Quyết định + cấu hình GA4 | PlatformEngineer | Ngày 1 | GA4 còn trong bundle sau deploy | Bạn quyết (§6 c3) |
| T2 | Hợp nhất nhánh local ↔ `origin/main` | PlatformEngineer | Ngày 1 | `git merge-tree` không xung đột | T1 |
| T3 | Deploy lên prod | PlatformEngineer | Ngày 2 | `BUILD_ID` prod khớp repo | **Cần quyền Cloudflare** |
| T4 | Kiểm chứng `robots.txt`, `sitemap.xml`, PDF → 200 | PlatformEngineer | Ngày 3 | 3 đường dẫn trả 200 | T3 |
| T5 | Dựng trang combo 499.000đ | PlatformEngineer | Ngày 5 | Trang combo thật, mua được | T3 + bạn chốt nội dung |
| T6 | Xin quyền đăng kênh | Chủ sở hữu | Ngày 7 | Đăng được 1 bài thật | Cần bạn cấp quyền |
| T7 | Commit working tree + đẩy GitHub | PlatformEngineer | Ngày 7 | Clone sạch build được; CI chạy được | **Cần quyền GitHub** |
| T8 | Đăng 10 bài social | GrowthContent | Ngày 14 | 10/10 bài lên kênh, có UTM riêng | T6 |
| T9 | Gửi sitemap lên Search Console | GrowthContent | Ngày 10 | Search Console nhận sitemap | T4 |
| T10 | Kiểm tra nút mua sách + tồn kho | PlatformEngineer | Ngày 12 | Đặt hàng thử thành công | T3 |
| T11 | Tối ưu landing | GrowthContent | Ngày 21 | Landing rõ sản phẩm + giá + UTM | T3 |
| T12 | Email tự động trả lời + gửi PDF | PlatformEngineer | Ngày 28 | Form submit → nhận PDF + chuỗi email | T4 |
| T13 | Báo cáo tuần từ GA4 + UTM | DataOps | Ngày 37 | Báo cáo chạy đúng giờ, số từ Convex | T3 |
| T14 | Tối ưu landing theo dữ liệu | GrowthContent | Ngày 44 | Tỷ lệ lead/truy cập tăng | T13 |
| T15 | Thử retargeting Facebook | Sales | Ngày 51 | 1 chiến dịch chạy | T13 |
| T16 | Thu 5 testimonial | Community | Ngày 58 | 5 review có tên/ảnh | T8 |
| T17 | 20 bài blog SEO | GrowthContent | Ngày 60 | 20 bài publish | T4 |
| T18 | Bán nốt tồn kho sách | Sales | Ngày 60 | Hết tồn hoặc còn dưới 20 bản | T10 |
| T19 | Chuyển đổi sách đầu tiên từ lead | Sales | Ngày 67 | ≥5 đơn sách | T18 |
| T20 | Xây social proof | Community | Ngày 74 | 10+ testimonial thật | T16 |
| T21 | Tối ưu SEO | GrowthContent | Ngày 81 | 50 từ khoá vào top 100 | T17 |
| T22 | Mở 2 kênh mới | GrowthContent | Ngày 88 | 2 kênh hoạt động | T6 |
| T23 | Khảo sát nhu cầu khoá văn phòng | Product | Ngày 75 | ≥10 người xác nhận trả tiền | Cần tuyển agent |
| T24 | Danh sách 20 doanh nghiệp Hàn B2B | BD | Ngày 80 | Có danh sách + 5 cuộc gọi | Cần tuyển agent |
| T25 | Quyết định mở rộng hay dừng | CEO | Ngày 90 | Báo cáo quyết định kèm số thật | T1–T24 |

---

## 6. Việc cần bạn quyết

**Gấp nhất — 2 thẻ kết nối tôi vừa gửi lại** (thẻ cũ đã hết hạn khi task đổi người nhận):

1. **Cloudflare** — để deploy bundle đã build sẵn lên prod. Không có thì N2–N5 không sửa được. Đây là chặn của mọi việc P0.
2. **GitHub** — để đẩy 4 commit SEO chưa lên + commit trạng thái working tree.

**Cần bạn quyết về kỹ thuật (mới, phát sinh từ §0b):**

3. **GA4: chọn 1 trong 2 cách.** (a) Giữ cách của bạn — hard-code `G-E5DZZJLMBX` trong `app/layout.tsx` như `origin/main`; (b) Giữ cách của local — dùng biến `NEXT_PUBLIC_GA4_ID`, và tôi sẽ thêm biến đó vào `.env.production` + workflow CI. Tôi nghiêng về (b) vì đổi ID không phải sửa code, nhưng (a) đơn giản hơn và đang chạy thật.
4. **Cho tôi commit trạng thái hiện tại của repo?** Có 22 file đã sửa chưa commit + 14 file chưa vào Git. Không commit thì repo không tái tạo được và CI không chạy. Đây là thay đổi lớn trong repo của bạn nên tôi xin phép trước.

**Cần bạn quyết về kinh doanh (giữ từ v3):**

5. **Cho phép tuyển 5 agent?** Tên và vai ở §4.3.
6. **Cấp quyền kênh:** TikTok, YouTube, quyền đăng Reels trên fanpage "Tiếng Hàn Chuyên Ngành HDP"?
7. **Cấp dữ liệu thật:** doanh thu, giá vốn in sách, chi phí video, số đơn, số lead, traffic, kênh bán tốt nhất?
8. **Xác nhận khoá "Tiếng Hàn hành chính văn phòng"** có tồn tại không? Tôi chưa thấy trong hệ thống.
9. **Xác nhận tồn kho sách thật** đúng 74 bản?
10. **Combo 499.000đ:** giá và quyền lợi combo là gì? Chưa có gì trong code. Tôi cần bạn chốt nội dung mới dựng được trang.
11. **Duyệt bảng KPI mục tiêu** ở §4.1?

Sau khi có Cloudflare và bạn duyệt, tôi tách danh sách ở §5 thành task con và triển khai Giai đoạn 1.
