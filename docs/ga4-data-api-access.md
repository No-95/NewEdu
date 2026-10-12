# Cấp quyền đọc GA4 Data API — runbook

Task: [HDP-13](/HDP/issues/HDP-13) · Property: `G-E5DZZJLMBX` · Site: https://hdpedu.com
Người chạy: chủ sở hữu HDP EDU (bước Google Cloud **không thể** làm bằng agent — xem §0)

---

## §0. Vì sao cần chủ sở hữu, không phải agent

Mọi bước còn lại của HDP EDU đều do agent làm. Bước này thì không. Lý do cụ thể, đã đo:

| Việc | Ai làm được | Bằng chứng |
|---|---|---|
| Tạo service account + tải JSON key | **Chỉ chủ sở hữu** | Cần đăng nhập Google Cloud Console bằng tài khoản sở hữu GA4 property. Máy này không có `gcloud`, không có `~/.config/gcloud`, không có Application Default Credentials. |
| Cấp quyền Viewer trên GA4 property | **Chỉ chủ sở hữu** | Cần quyền Admin trên property. Agent không có tài khoản Google nào thuộc property đó. |
| Dán JSON key vào Paperclip secret | **Chỉ chủ sở hữu** | Agent chỉ *đề xuất* được secret, không *tạo* được (xem §4). |

**Không có đường vòng.** Paperclip không có connector nào cho Google Analytics / Google Cloud. Đã tra catalog đầy đủ (20 service):

```
GET/POST /runtime-tools/connections/search {"query":""}
→ agentmail airtable asana box clickhouse cloudflare cloudinary cognee discord
  facebook fireflies github gmail google-calendar google-chat google-docs
  google-drive google-people google-sheets google-slides
```

Không có `google-analytics`, `google-cloud`, `bigquery`. Tra thêm `"google analytics"`, `"ga4"`, `"gcp"`, `"analytics"`, `"tag manager"`, `"search console"` → **0 kết quả**. Aggregator (Composio/Arcade/Zapier) cũng không có route GA4.

Một service account là **danh tính mới trong Google Cloud**, không phải một quyền trên danh tính sẵn có. Không có danh tính Google nào đang được cấp cho agent, nên không có gì để "mở rộng quyền".

---

## §1. Tạo service account (chủ sở hữu, ~3 phút)

1. Mở https://console.cloud.google.com/ → chọn hoặc tạo project (ví dụ `hdp-edu-analytics`).
2. **APIs & Services → Library** → tìm **Google Analytics Data API** → **Enable**.
3. **IAM & Admin → Service Accounts → Create service account**
   - Name: `ga4-reader`
   - Role: để trống (quyền đọc GA4 được cấp ở GA4, không phải ở GCP IAM).
   - **Done**
4. Mở service account vừa tạo → tab **Keys** → **Add key → Create new key → JSON** → tải file về.
5. Ghi lại `client_email` trong file JSON. Nó có dạng:
   `ga4-reader@<project-id>.iam.gserviceaccount.com`

> **Đừng** commit file JSON. Đừng dán vào comment. Đừng để trong repo.

---

## §2. Cấp quyền đọc trên GA4 property (chủ sở hữu)

Bước này hay bị bỏ sót và là nguyên nhân của mọi lỗi `403 PERMISSION_DENIED`.

1. Mở https://analytics.google.com/ → chọn property của `hdpedu.com`.
2. **Admin** (bánh răng, góc dưới trái) → **Property access management**.
3. **+** (góc phải trên) → **Add users**.
4. Email: dán `client_email` ở §1.5.
5. Role: **Viewer** (đủ để đọc Data API; không cần Editor).
6. **Add**.

Kiểm tra: sau bước này, service account phải xuất hiện trong danh sách property access management.

---

## §3. Xác minh trước khi đưa key cho agent (chủ sở hữu)

Đây là bước tự kiểm tra — chạy trên máy có file JSON. Mọi thứ đã sẵn sàng, không cần cài gì thêm.

```bash
cd /home/n00bie/workspace/hdpedu-newedu

# 3a. Kiểm tra bộ công cụ đúng (không cần credential) — phải in PASS
pnpm run ga4:selftest

# 3b. Kiểm tra danh tính + tìm property id số từ measurement id
GA4_SERVICE_ACCOUNT_FILE=/đường/dẫn/key.json pnpm run ga4:resolve-property
```

Kết quả **3b** phải giống:

```
service account : ga4-reader@<project>.iam.gserviceaccount.com
access token    : minted, expires in 3600s
measurement id G-E5DZZJLMBX -> properties/123456789
  property name : <tên property>
  account       : <tên account>
  stream        : hdpedu.com (https://hdpedu.com)
```

**Lấy số `properties/123456789` ở dòng thứ 3** — đó là `GA4_PROPERTY_ID` mà agent Dữ liệu & Vận hành cần. Không phải `G-E5DZZJLMBX` (đó là *measurement id*, Data API không nhận).

Chạy thử một báo cáo thật:

```bash
GA4_SERVICE_ACCOUNT_FILE=/đường/dẫn/key.json node scripts/ga4-data-api.mjs report \
  --property-id 123456789 --start 2026-10-05 --end 2026-10-11 \
  --metrics sessions,totalUsers,eventCount
```

### Nếu gặp lỗi

| Lỗi | Nghĩa | Sửa |
|---|---|---|
| `HTTP 403 PERMISSION_DENIED` | Service account chưa được thêm vào GA4 property | Làm §2 |
| `HTTP 403 ... has not been used in project ... or it is disabled` | Chưa enable Data API | Làm §1.2 |
| `invalid_grant: account not found` | Key sai / service account đã bị xoá | Tạo key mới §1.4 |
| `measurement id ... NOT found` | §2 chưa xong, hoặc property khác | Kiểm tra lại §2 |

---

## §4. Đưa key cho agent (chủ sở hữu)

Agent **không thể** tự tạo secret. Chỉ *đề xuất* được, và đề xuất đó cần người duyệt.
Vì vậy hãy để chủ sở hữu đưa thẳng key vào Paperclip — nhanh hơn và không cần duyệt gì.

Mở Paperclip → **Company → Secrets → Create secret**:

| Trường | Giá trị |
|---|---|
| Name | `GA4 service account (hdpedu)` |
| Key | `ga4_service_account` |
| Value | dán **toàn bộ** nội dung file JSON (một dòng hoặc nhiều dòng đều được) |

Sau đó tạo **binding** cho agent **Dữ liệu & Vận hành** (`d-li-u-v-n-h-nh`):

| Trường | Giá trị |
|---|---|
| Agent | Dữ liệu & Vận hành |
| Config path | `access.ga4_service_account` |
| (hoặc) | `env.GA4_SERVICE_ACCOUNT_JSON` nếu muốn tiêm vào môi trường |

> Chọn `access.*` nếu agent chỉ cần đọc lúc cần. Chọn `env.*` nếu muốn giá trị tự có mặt trong mọi lần chạy.

### Binding thứ hai (khuyến nghị) — để nghiệm thu chạy được

Tiêu chí nghiệm thu của HDP-13 đòi **bằng chứng thô** từ `runReport`. Chỉ agent có binding
mới đọc được key, nên nếu chỉ bind cho Dữ liệu & Vận hành thì bước §5 phải do agent đó chạy
và dán kết quả — chậm hơn một vòng.

Thêm một binding nữa cùng secret, cùng config path, cho **Kỹ sư Nền tảng**
(`k-s-n-n-t-ng`). Khi đó Kỹ sư Nền tảng tự chạy §5 và dán output thô vào HDP-13 ngay.

> Đây **không phải** quyền thừa: binding này chỉ đọc, chỉ dùng để chạy phép thử nghiệm thu.
> Nếu bạn muốn tối thiểu quyền, bỏ qua bước này — HDP-13 sẽ khép lại bằng kết quả của
> Dữ liệu & Vận hành thay vì của Kỹ sư Nền tảng.

**Lưu ý về `self_and_reports`:** agent chỉ đề xuất được binding cho **chính mình** hoặc
**cấp dưới trực tiếp** của mình. Dữ liệu & Vận hành là **ngang cấp** với Kỹ sư Nền tảng
(cả hai đều báo cáo CEO), nên Kỹ sư Nền tảng **không thể** tự đề xuất binding này.
Đây là lý do bước §4 bắt buộc phải do chủ sở hữu làm.

**Tiêu chí nghiệm thu của HDP-13** chính là endpoint này:

```bash
curl -s -X POST -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  "$PAPERCLIP_API_BASE/api/agents/me/secrets/ga4_service_account/value"
# → {"key":"ga4_service_account","value":"{...JSON key...}","version":1}
```

Key name trong URL phải khớp `Key` ở bảng trên.

---

## §5. Nghiệm thu (agent Dữ liệu & Vận hành, hoặc Kỹ sư Nền tảng)

Sau khi §4 xong, hai lệnh này phải cho ra **số thật**, không phải 401/403:

```bash
cd /home/n00bie/workspace/hdpedu-newedu

# 5a. Danh tính đọc được property — phải liệt kê được property của hdpedu.com
pnpm run ga4:whoami

# 5b. runReport trả dữ liệu
node scripts/ga4-data-api.mjs report \
  --property-id <số ở §3b> --start 2026-10-05 --end 2026-10-11 \
  --metrics sessions,totalUsers,eventCount --dimensions sessionDefaultChannelGroup
```

Nếu chạy trong môi trường có secret đã tiêm:

```bash
node scripts/ga4-data-api.mjs whoami          # đọc env.GA4_SERVICE_ACCOUNT_JSON
node scripts/ga4-data-api.mjs report --property-id <số> --start 7daysAgo --end today
```

---

## Phụ lục — bộ công cụ đọc GA4

`scripts/ga4-data-api.mjs` — không phụ thuộc thư viện ngoài (chỉ `node:crypto` + `fetch`),
để repo vẫn build được từ bản clone sạch. Tự ký JWT RS256 (RFC 7523) và đổi lấy access token.

| Lệnh | Việc |
|---|---|
| `selftest` | Chứng minh code đúng **không cần credential** (gửi một assertion rác lên Google, Google phải trả `invalid_grant`) |
| `whoami` | Liệt kê mọi property + data stream mà service account thấy được |
| `resolve-property` | Đổi `G-E5DZZJLMBX` → property id **số** |
| `report` | Gọi `runReport` |

Nguồn credential, thứ tự ưu tiên: `--key-file` → `GA4_SERVICE_ACCOUNT_FILE` →
`GA4_SERVICE_ACCOUNT_JSON` → `GA4_SERVICE_ACCOUNT_KEY`.

Công cụ **không bao giờ** ghi key ra đĩa, không in key, không ghi log key. Nó chỉ in
`client_email` (định danh, không phải bí mật).
