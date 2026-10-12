# Đường đọc số đơn / doanh thu cho Bán hàng — trạng thái & cách mở khoá

Task: [HDP-15](/HDP/issues/HDP-15) · Deployment Convex: `adept-tapir-159` · Repo: `~/workspace/hdpedu-newedu`

## 1. Nguyên nhân gốc (một câu)

**Deployment Convex `adept-tapir-159` chưa từng được deploy lại kể từ `2026-10-06T21:09:04Z`**,
nên toàn bộ query đơn/doanh thu (`dashboard.getOrderSummary`, `getRevenueSummary`,
`getTotalUsers`, `getNewUsers`, `getActiveLearners`, `registrationsBySource`) **không tồn tại
trên deployment** — chúng mới chỉ được thêm vào `convex/dashboard.ts` trong commit `d6f6433`
(2026-10-11), tức **sau** lần deploy cuối.

Đây không phải lỗi phân quyền. Bằng chứng phân biệt hai khả năng:

| Gọi | Kết quả | Ý nghĩa |
|---|---|---|
| `dashboard:getOrderSummary` `{}` | `{"status":"error","errorMessage":"… Server Error"}` | hàm mới → không có trên deployment |
| `dashboard:getTotalUsers` `{}` | Server Error | (hàm này không thể throw với `{}`) |
| `dashboard:getLearnerDashboard` `{"email":"<email thật>"}` | **`success`** | **cùng module `dashboard`, hàm cũ → deployment KHÔNG chặn module này** |
| `courses:getPublishedCourses` `{}` | `success` | hàm cũ, cùng deployment |

Cùng một deployment, cùng một client ẩn danh: hàm cũ chạy được, hàm mới thì không.
Vậy nguyên nhân là **build-vs-source drift**, không phải auth.

## 2. Vì sao deploy đang bị chặn

`npx convex deploy` cần một trong hai:

- `CONVEX_DEPLOY_KEY` (prod deploy key của `adept-tapir-159`), hoặc
- project đã `convex dev` (tạo `.convex/` + `CONVEX_DEPLOYMENT`).

Đã đo trong heartbeat 2026-10-12:

```
$ echo "$CONVEX_DEPLOY_KEY"        -> <unset>
$ echo "$CONVEX_DEPLOYMENT"        -> <unset>
$ ls -d ~/.convex .convex          -> không tồn tại
$ npx convex deploy                -> ✖ No CONVEX_DEPLOYMENT set, run `npx convex dev`…
$ GET /api/agents/me/secrets       -> {"secrets":[]}
$ POST /api/agents/me/secrets/CONVEX_DEPLOY_KEY/value -> 403 Secret access is not granted
```

Máy này **không có** đăng nhập Convex và **không có** credential Convex nào được cấp.
Không có đường vòng: agent không tự tạo được secret cho chính mình.

## 3. Đã làm sẵn (chỉ còn thiếu bước deploy)

`convex/orders.ts` — `orders:getSalesSummary`, query **không cần auth**, **không trả PII**:

```bash
curl -sS -X POST https://adept-tapir-159.convex.cloud/api/query \
  -H 'Content-Type: application/json' \
  -d '{"path":"orders:getSalesSummary","args":{},"format":"json"}'
```

Trả về (đúng các trường issue yêu cầu):

```json
{
  "totalOrders": <số>,
  "totalRevenue": <VND>,
  "currency": "VND",
  "courseOrdersPaid": <số>, "courseOrdersPending": <số>, "courseOrdersFailed": <số>,
  "courseRevenue": <VND>,
  "bookOrders": <số>, "bookOrdersLast30d": <số>,
  "transactionsTotal": <số>, "depositTotal": <VND>, "transactionPurchaseTotal": <VND>,
  "windowDays": null, "generatedAt": <ms>, "notes": [ ... ]
}
```

Quy ước số liệu:

- `totalOrders` = đơn khoá học đã kích hoạt (`purchases.status === 'active'`) + đơn sách (`bookOrders`).
- `totalRevenue` = tổng `purchases.amount` với `status === 'active'`. Bảng `bookOrders`
  **không lưu giá trị tiền** (xem `convex/schema.ts`), nên đơn sách chỉ đếm, không cộng tiền.
- Tham số tuỳ chọn `sinceDays` để giới hạn cửa sổ; bỏ trống = toàn bộ thời gian.
- **Riêng tư:** chỉ trả số đếm và tổng tiền. Không tên, không email, không SĐT, không địa chỉ.
  Có test khẳng định điều này (`tests/sales-summary.test.ts`).

Đã kiểm chứng cục bộ bằng `convex-test`:

```
$ NODE_ENV=development pnpm vitest run tests/sales-summary.test.ts
 ✓ tests/sales-summary.test.ts (2 tests)
 Test Files  1 passed (1) · Tests  2 passed (2)
```

## 4. Bước còn lại — cần chủ sở hữu cấp quyền

Chọn **một** trong hai, cách nào cũng xong:

**4a. Cấp `CONVEX_DEPLOY_KEY` cho agent Kỹ sư Nền tảng** (Paperclip → Secrets → tạo secret +
binding `env.CONVEX_DEPLOY_KEY` cho agent `0e2655b0-5126-459e-b9d1-6f2a3b2430d3`).
Sau đó agent chạy:

```bash
cd /home/n00bie/workspace/hdpedu-newedu && npx convex deploy --yes
```

**4b. Chủ sở hữu tự chạy một lệnh** (không cấp credential thường trực):

```bash
cd /home/n00bie/workspace/hdpedu-newedu && npx convex deploy --yes
```

Cả hai cách đều **không được dán key vào comment hay file**.

## 5. Kiểm chứng sau khi deploy (bắt buộc, không tin exit code)

```bash
curl -sS -X POST https://adept-tapir-159.convex.cloud/api/query \
  -H 'Content-Type: application/json' \
  -d '{"path":"orders:getSalesSummary","args":{},"format":"json"}'
```

Phải trả `"status":"success"` kèm `totalOrders` + `totalRevenue`. Khi đó Bán hàng gọi được
bằng chính lệnh `curl` ở §3 và ghi **đúng giá trị đọc được** vào [HDP-8](/HDP/issues/HDP-8).

## 6. Liên quan

- [HDP-4](/HDP/issues/HDP-4) — deploy bundle Next.js lên Cloudflare (cùng họ blocker: thiếu credential deploy).
- [HDP-5](/HDP/issues/HDP-5) — quyền ghi GitHub (read-only).
