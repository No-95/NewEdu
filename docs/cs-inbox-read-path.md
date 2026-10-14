# Đường đọc phản hồi cho `cs@hdpedu.com` — trạng thái & cách mở khoá

Task: [HDP-16](/HDP/issues/HDP-16) · Repo: `~/workspace/hdpedu-newedu` · Deployment: `adept-tapir-159`

## 1. Nguyên nhân gốc (một câu)

**`cs@hdpedu.com` là hộp Zoho Mail (`MX = mx.zoho.com`) mà không agent/process nào có credential để đọc** —
mọi thư lead trả lời về `Reply-To: cs@hdpedu.com` rơi vào hộp mù, nên phễu B2B đứt ở bước "khách trả lời".

Bằng chứng đo được (2026-10-14):

| Kiểm tra | Kết quả thô | Nguồn |
|---|---|---|
| MX `hdpedu.com` | `10 mx.zoho.com`, `20 mx2.zoho.com`, `50 mx3.zoho.com` | DoH `cloudflare-dns.com` |
| TXT/SPF | `v=spf1 include:zohomail.com ~all` | DoH |
| `GET api.resend.com/domains` | `hdpedu.com` → `capabilities.receiving = "disabled"` | Resend API |
| Credential IMAP/mail trong env run | không có (chỉ `RESEND_API_KEY`, `SMTP_HOST=smtp.gmail.com`) | `env` |
| Paperclip secrets | `GET /api/agents/me/secrets` → `{"secrets":[]}` | API |
| Connection route cho Zoho/Mail | `connections_search "zoho mail"` → 0 kết quả | MCP |
| Credential trong `~/.hermes/.env`, `state.db`, dotfiles | không có `ZOHO*`/`IMAP*`/app-password nào | grep |
| `imap.zoho.com:993` | **mở được** (TCP OK) | socket connect |

⇒ Không thiếu hạ tầng: hộp thư tồn tại và IMAP của Zoho truy cập được. Chỉ thiếu **credential**.

## 2. Đã làm sẵn (chỉ còn thiếu 1 bước của chủ sở hữu)

### 2a. Code — đường đọc hai chế độ, tự chọn theo credential

`scripts/read-cs-inbox.mjs` + `scripts/lib/cs-inbox.mjs`:

| Chế độ | Khi nào dùng | Credential cần | Cần đổi DNS? |
|---|---|---|---|
| `resend` | Domain con `reply.hdpedu.com` đã verify + MX | `RESEND_API_KEY` (đã có) | **Có** — thêm 5 bản ghi |
| `imap` | Đọc thẳng hộp Zoho, giữ nguyên `cs@hdpedu.com` | `CS_INBOX_IMAP_USER` + `CS_INBOX_IMAP_PASSWORD` (app-password) | **Không** |

Đường đọc đã chạy thật, không phải kế hoạch:

```
$ node scripts/read-cs-inbox.mjs --mode resend --dry-run --json
{"ok":true,"mode":"resend","checkedAt":"2026-10-14T08:34:37.413Z","mailbox":"cs@hdpedu.com",
 "fetched":0,"newReplies":0,"skippedAutomatic":0,"skippedSeen":0,"blockedByAllowlist":0,"replies":[]}

$ env -u RESEND_API_KEY -u CS_INBOX_IMAP_USER -u CS_INBOX_IMAP_PASSWORD node scripts/read-cs-inbox.mjs --json
{"ok":false,"mode":null,"reason":"no_credential","message":"Không có đường đọc nào. Cần RESEND_API_KEY ..."}

$ CS_INBOX_IMAP_USER=cs@hdpedu.com CS_INBOX_IMAP_PASSWORD=<sai> node scripts/read-cs-inbox.mjs --mode imap --dry-run --json
{"ok":false,"mode":"imap","reason":"auth_failed","message":"Đăng nhập imap thất bại (Invalid credentials(Failure)). Với Zoho phải dùng app-password, ..."}
```

Dòng thứ ba là bằng chứng quan trọng: **IMAP của Zoho đã kết nối được**, chỉ sai mật khẩu.
Nghĩa là khi có app-password thật, chế độ `imap` chạy ngay, **không cần đổi DNS gì cả**.

Đặc tính đã kiểm chứng bằng test (`tests/cs-inbox.test.ts`, 20 test pass):

- Bóc địa chỉ từ `"Tên" <a@b.com>`; khử trùng theo ID ổn định qua các lần poll.
- Bỏ thư máy (`auto-submitted`, `precedence: bulk`, `list-unsubscribe`, localpart `no-reply`/`mailer-daemon`).
- Khớp người gửi với danh sách 20 công ty B2B (theo email, rồi theo domain) → Sales biết thư thuộc chiến dịch nào.
- Header ngày hỏng → ghi `null`, không làm vỡ cả lần poll.
- Allowlist người gửi (`CS_INBOX_SENDER_ALLOWLIST`, rỗng = nhận tất cả).

Chạy:

```
$ NODE_ENV=development pnpm vitest run tests/cs-inbox.test.ts
 ✓ tests/cs-inbox.test.ts (20 tests)
 Test Files  1 passed (1) · Tests  20 passed (20)
```

### 2b. Resend Inbound — đã bật, chờ DNS

Đã tạo domain con **`reply.hdpedu.com`** trong Resend (`id 91a61b78-1124-4428-9f83-9c8822879caf`)
và **bật `capabilities.receiving`**:

```
$ curl -X PATCH -H "Authorization: Bearer $RESEND_API_KEY" \
    -d '{"capabilities":{"receiving":"enabled"}}' \
    https://api.resend.com/domains/91a61b78-1124-4428-9f83-9c8822879caf
{"object":"domain","id":"91a61b78-1124-4428-9f83-9c8822879caf"}   HTTP 200

$ curl -H "Authorization: Bearer $RESEND_API_KEY" .../91a61b78-...
{"name":"reply.hdpedu.com","status":"pending","capabilities":{"sending":"enabled","receiving":"enabled"}}
```

**Vì sao dùng domain con chứ không bật receiving trên `hdpedu.com`:** bật receiving trên
`hdpedu.com` bắt Resend ghi đè bản ghi MX đang trỏ về Zoho, tức **phá hộp thư cs@hdpedu.com
đang chạy**. Domain con `reply.hdpedu.com` có MX riêng nên **không đụng gì tới Zoho**.

Cách dùng: đổi `Reply-To` của email B2B từ `cs@hdpedu.com` sang `cs@reply.hdpedu.com`
(hoặc thêm alias). Người nhận vẫn thấy thư từ `cs@hdpedu.com`.

5 bản ghi DNS cần thêm (lấy trực tiếp từ Resend API):

| Type | Name | Value | Priority |
|---|---|---|---|
| MX | `reply` | `inbound-smtp.ap-northeast-1.amazonaws.com` | 10 |
| TXT | `resend._domainkey.reply` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC9/agYsdnACCBrGTgVd/OQ58ThMgLmaJsHYYM+wmORKOkABY/PvFy/LfAAg1lkdN6y6tzLv9Eelfe2ePyqJBz4RGF3EZUk0FdMUJpcsTRe/IjYiTAmVOsVeYyyXrM9lh6X8l1Dwkh73td1YqrwS/W4R+wRiWXXBy2RXjLdpjytDwIDAQAB` | – |
| MX | `send.reply` | `feedback-smtp.ap-northeast-1.amazonses.com` | 10 |
| TXT | `send.reply` | `v=spf1 include:amazonses.com ~all` | – |
| CNAME | `rsend.reply` | `send.forge.rmta.net` | – |

## 3. Bước còn lại — chủ sở hữu chọn **một** trong hai

Cả hai đều cần **một người bấm duyệt** (agent không tự tạo secret cho mình, và đổi DNS là
hành động owner-gated). Chọn **4a** là rẻ nhất và không đụng DNS.

**4a. Cấp app-password Zoho cho agent Kỹ sư Nền tảng** ← khuyến nghị

1. Trong Zoho Mail → Settings → Security → App Passwords, tạo app-password cho `cs@hdpedu.com`.
2. Paperclip → Secrets → Propose, tạo 2 secret + binding cho agent `0e2655b0-5126-459e-b9d1-6f2a3b2430d3`:
   - `CS_INBOX_IMAP_USER` = `cs@hdpedu.com`
   - `CS_INBOX_IMAP_PASSWORD` = app-password vừa tạo
3. **Không dán app-password vào comment.** Nếu muốn agent tự đề xuất: gửi giá trị vào
   `POST /api/agents/me/secret-proposals` (đã ghi rõ cách làm trong skill Paperclip).

Xong bước này, đường đọc chạy ngay — **không cần thêm DNS, không cần đổi `Reply-To`**:

```
node scripts/read-cs-inbox.mjs --mode imap --json
```

**4b. Thêm 5 bản ghi DNS ở §2b** (bảng trên) vào zone `hdpedu.com`.
Agent có connection Cloudflare đã cài nên **viết được bản ghi bằng API**, nhưng thay đổi DNS
là hành động cần chủ sở hữu cho phép → cần một câu "đồng ý" trong issue này trước khi agent ghi.
Sau đó agent tự ghi bản ghi, chờ Resend verify, rồi đổi `Reply-To` sang `cs@reply.hdpedu.com`.

## 4. Kiểm chứng sau khi mở khoá (bắt buộc — 1 thư thật)

1. Gửi một thư từ **hộp ngoài** (ví dụ Gmail cá nhân) tới địa chỉ của đường đọc.
2. Chạy `node scripts/read-cs-inbox.mjs --json` và dán nguyên kết quả vào [HDP-16](/HDP/issues/HDP-16):
   phải thấy `"newReplies": 1` kèm `from`, `subject`, `receivedAt`, `preview`.
3. Chạy lại lần thứ hai: phải là `"newReplies": 0, "skippedSeen": 1` → chứng minh khử trùng đúng.
4. Ghi rõ **owner của hộp thư** (routine nào / agent nào) và **SLA trả lời ≤ 24h**.

## 5. Owner hộp thư & SLA

- **Owner đọc:** agent **Bán hàng** (`e0564184-d885-46c2-b38b-684af8a9d34b`), qua routine gọi
  `scripts/read-cs-inbox.mjs` mỗi giờ trong giờ làm việc — cùng mô hình đã dùng cho
  `hdpedu-messenger-auto`.
- **SLA:** thư vào hộp → có người đọc trong **≤ 1 giờ**, trả lời khách trong **≤ 24 giờ**.
- Routine do agent Bán hàng tự tạo (agent chỉ tạo được routine gán cho chính mình).

## 6. Liên quan

- [HDP-8](/HDP/issues/HDP-8) — nguồn: 10 email B2B đã gửi, 0 phản hồi đọc được.
- [HDP-15](/HDP/issues/HDP-15) — cùng họ "đường đọc cho Bán hàng", đã xong bằng `orders:getSalesSummary`.
- [HDP-4](/HDP/issues/HDP-4) — cùng họ blocker thiếu credential deploy.
