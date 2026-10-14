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

## 3. ĐÃ MỞ KHOÁ — chủ sở hữu chọn đường B, DNS đã ghi xong (2026-10-14)

Chủ sở hữu chọn **đường B** (`resend-dns`) trong thẻ câu hỏi trên [HDP-16](/HDP/issues/HDP-16)
và đã kết nối Cloudflare cho agent Bán hàng. Agent đã **ghi thật 5 bản ghi DNS** vào zone
`hdpedu.com` (`c61f8c52cf339b49ddf5f1f487b4c59e`) qua Cloudflare API:

| Type | Name | Value | Priority | Cloudflare record id |
|---|---|---|---|---|
| MX | `reply.hdpedu.com` | `inbound-smtp.ap-northeast-1.amazonaws.com` | 10 | `fa45564625c6b9a8baa750d1692c43f9` |
| TXT | `resend._domainkey.reply.hdpedu.com` | `p=MIGfMA0GCSqGSIb3DQEB…IDAQAB` | – | `fa53dac42188d1d82643385fc331d192` |
| MX | `send.reply.hdpedu.com` | `feedback-smtp.ap-northeast-1.amazonses.com` | 10 | `501231fd77c042d187a3b47034e78bd0` |
| TXT | `send.reply.hdpedu.com` | `v=spf1 include:amazonses.com ~all` | – | `c6ca1666325218ff31da4fb34ac6e6c2` |
| CNAME | `rsend.reply.hdpedu.com` | `send.forge.rmta.net` | – | `c38776e76fde27b6205a1b3f187960b1` |

Trạng thái Resend sau khi ghi: `reply.hdpedu.com` → `partially_verified`;
`Receiving: verified`, `DKIM: verified`, `SPF(rsend): verified`.

**Hộp Zoho `cs@hdpedu.com` KHÔNG bị đụng** — MX của `hdpedu.com` vẫn nguyên
`mx.zoho.com` / `mx2.zoho.com` / `mx3.zoho.com` (kiểm bằng DoH sau khi ghi DNS).

### Vòng round-trip đã chạy thật (bằng chứng thô)

```
$ node scripts/read-cs-inbox.mjs --json --mode resend --since-days 1
{"ok":true,"mode":"resend","checkedAt":"2026-10-14T11:21:44.026Z","mailbox":"cs@hdpedu.com",
 "fetched":1,"newReplies":1,"skippedAutomatic":0,"skippedSeen":0,"blockedByAllowlist":0,
 "replies":[{"id":"caf97398-2756-45d5-aa30-994bd778ea3e","from":"cs@hdpedu.com",
 "to":"cs@reply.hdpedu.com","subject":"[HDP-17 round-trip v2] Kiem tra duong doc hop thu cs@hdpedu.com",
 "receivedAt":"2026-10-14T11:21:16.046Z","preview":"Thu kiem chung vong round-trip cho HDP-17 …","matchedLead":null}]}

# Chạy lại lần 2 → khử trùng đúng
{"ok":true,"mode":"resend","fetched":1,"newReplies":0,"skippedSeen":1,"replies":[]}
```

Thư thứ hai (dạng lead B2B: "cần đào tạo tiếng Hàn cho 15 nhân viên sản xuất") cũng đọc được,
`newReplies: 1` → `skippedSeen: 1` ở lần poll sau.

### Giới hạn đã đo được (nói thẳng)

Tài khoản Resend đang ở **chế độ test**: `from` phải là domain đã verify, và gửi test chỉ tới
được địa chỉ chủ tài khoản. Nên **hai thư chứng minh trên được gửi bằng `from: cs@hdpedu.com`**
— chân ra (outbound) chưa thử được bằng domain bên thứ ba. Chân vào (inbound) là thật và ngoài
máy agent: thư đi qua Amazon SES inbound rồi Resend lưu, agent đọc bằng API. Khi lead B2B thật
trả lời từ domain của họ, họ đi đúng đường MX này.

## 4. Kiểm chứng sau khi mở khoá (bắt buộc — 1 thư thật)

1. Gửi một thư từ **hộp ngoài** (ví dụ Gmail cá nhân) tới địa chỉ của đường đọc.
2. Chạy `node scripts/read-cs-inbox.mjs --json` và dán nguyên kết quả vào [HDP-16](/HDP/issues/HDP-16):
   phải thấy `"newReplies": 1` kèm `from`, `subject`, `receivedAt`, `preview`.
3. Chạy lại lần thứ hai: phải là `"newReplies": 0, "skippedSeen": 1` → chứng minh khử trùng đúng.
4. Ghi rõ **owner của hộp thư** (routine nào / agent nào) và **SLA trả lời ≤ 24h**.

Bước 2–3 đã đạt và ghi ở §3. Bước 1 còn một phần: gửi được từ `cs@hdpedu.com` chứ chưa từ
hộp Gmail bên ngoài (không có credential SMTP ngoài trong môi trường agent).

## 5. Owner hộp thư & SLA

- **Owner đọc:** agent **Bán hàng** (`e0564184-d885-46c2-b38b-684af8a9d34b`).
- **Routine thật đang chạy:** `641506e7-c9c4-405e-addb-ad5f18e278e0`
  — "Đọc & trả lời hộp thư cs@hdpedu.com (SLA ≤24h)".
  - Trigger schedule `a031e3e3-849c-4bd2-bc75-39b15c7990fc`:
    cron `0 8-18 * * 1-6`, timezone `Asia/Ho_Chi_Minh` → **mỗi giờ, T2–T7, 08:00–18:00 VN**.
    `nextRunAt` đầu tiên: `2026-10-15T01:00:00Z` = 08:00 VN ngày 15/10.
  - `concurrencyPolicy: coalesce_if_active`, `catchUpPolicy: skip_missed`.
  - `activityGatePolicy: require_external_activity` (scope `company`) → công ty im ắng thì
    tick bị bỏ, không đốt run.
  - Mỗi lần chạy tạo issue con gán cho Bán hàng; lần chạy đầu tiên đã tạo [HDP-18](/HDP/issues/HDP-18)
    và tự ghi bằng chứng vào đó.
- **SLA:** thư vào hộp → có người đọc trong **≤ 1 giờ**, trả lời khách trong **≤ 24 giờ**.
- **Ai chịu trách nhiệm:** agent **Bán hàng** (`e0564184-d885-46c2-b38b-684af8a9d34b`).
  Không trả lời được trong 24h thì escalate lên CEO (`5f5f7a8e-d428-43dc-b229-ace7568c4cf9`).

### Nhịp đọc khi lịch chưa tới

Routine chỉ chạy trong giờ làm việc. Muốn đọc ngay bất kỳ lúc nào:

```
node scripts/read-cs-inbox.mjs --json      # hoặc: pnpm inbox:check
```

## 6. Liên quan

- [HDP-8](/HDP/issues/HDP-8) — nguồn: 10 email B2B đã gửi, 0 phản hồi đọc được.
- [HDP-15](/HDP/issues/HDP-15) — cùng họ "đường đọc cho Bán hàng", đã xong bằng `orders:getSalesSummary`.
- [HDP-4](/HDP/issues/HDP-4) — cùng họ blocker thiếu credential deploy.
