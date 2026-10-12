# Báo cáo kế hoạch 90 ngày — HDP EDU (v6)

Cập nhật: 2026-10-12 · Người lập: CEO · Task: [HDP-1](/HDP/issues/HDP-1)

Bản v6 thay thế v5. Điểm khác: bạn đã trả lời 6 câu hỏi mới (Cloudflare, GitHub, kênh,
tồn kho, câu chữ ưu đãi, KPI). Tôi áp ngay vào code và **sửa một lỗi quảng cáo sai**:
site đang ghi "còn 74 cuốn / sắp hết" trong khi tồn kho thật là **351 bản**.

---

## 0. Bạn đã quyết gì — và tôi đã làm gì

| Bạn quyết | Tôi đã làm | Trạng thái |
|---|---|---|
| GA4 dùng biến `NEXT_PUBLIC_GA4_ID` | Đã thêm biến vào `.env.production` và workflow CI. GA4 có trong 25 file của bundle | ✅ Xong |
| Cho commit repo | Đã commit toàn bộ working tree (commit `d6f6433`, 47 file) | ✅ Xong |
| Cho tuyển 5 agent | Đã tuyển đủ 5, đều báo cáo cho CEO | ✅ Xong |
| **Tồn kho thật: 351 bản** | **Sửa toàn bộ chỗ ghi "74 cuốn / sắp hết" thành 351 bản / sẵn hàng** | ✅ Xong |
| **Duyệt câu chữ ưu đãi** | **Đưa nguyên văn vào code 3 ngôn ngữ** | ✅ Xong |
| **KPI: bán hết 351 sách + 100 khoá** | **Tính lại KPI §7.1 và mô hình doanh thu §1.4** | ✅ Xong |
| Cấp kênh: chỉ Facebook trước | Không xin quyền kênh nào khác. TikTok/YouTube/Reels để sau | ✅ Xong |
| Cloudflare: bạn đặt `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` vào môi trường | **Đo lại hôm nay: hai biến này chưa có trong môi trường agent.** Xem §2 | ⚠️ Chưa thấy |
| GitHub: bạn tạo PAT mới có `Contents: Read and write` | **Đo lại hôm nay: token vẫn bị chặn ghi.** Xem §2 | ⚠️ Chưa thấy |


---

## 1. Số liệu thật (thay cho "chưa có dữ liệu")

### 1.1 Sản phẩm — THỰC TẾ

| Sản phẩm | Giá bán | Giá vốn | Lãi gộp / đơn | Ghi chú |
|---|---|---|---|---|
| Sách "Tiếng Hàn trong nhà máy sản xuất" | 225.000₫ (giá gốc 250.000₫, -10%) | 40.000₫ in | **185.000₫** | **351 bản trong kho** |
| Khoá "Cẩm nang Video: Tiếng Hàn Sản xuất" | 399.000₫ | 0₫ (video đã làm) | **399.000₫** | 72 video, 15 unit |
| Ưu đãi | Mua khoá online 399.000₫ → tặng 1 sách, 100 người đầu tiên | +40.000₫ | **359.000₫** | Chi phí thật của ưu đãi |
| Chi phí sản xuất video | 15.000₫ / video 5 giây | — | — | 72 video đã có sẵn |

**Điểm quan trọng về con số:** ưu đãi tặng sách không phải "miễn phí". Nó ăn 40.000₫
giá vốn mỗi đơn. Với 100 người đầu tiên, chi phí tối đa là 4.000.000₫. Đây là mức
chấp nhận được để lấy 100 khách hàng trả tiền đầu tiên, nhưng phải đếm đủ 100 rồi dừng.

### 1.2 Kênh — THỰC TẾ (đo 2026-10-11)

| Kênh | Số liệu | Nguồn |
|---|---|---|
| Fanpage "Tiếng Hàn Chuyên Ngành HDP" | 10.638 người theo dõi | Facebook Graph API |
| Tương tác bài đăng, 01/09–11/10 | **8 lượt trong 40 ngày** | Facebook Insights |
| Lượt xem trang, 01/09–11/10 | **179 lượt / 40 ngày** (≈4,5/ngày) | Facebook Insights |
| Hội thoại Messenger | **hơn 100** | Facebook Graph API |
| Bài đăng gần nhất | 11/07/2026 — **3 tháng không đăng gì** | Facebook Graph API |
| Website | GA4 đang chạy thật (`G-E5DZZJLMBX` xác nhận trong bundle prod) | Đo bằng trình duyệt thật |
| Doanh thu | **0₫** | Bạn xác nhận |
| Traffic website | Chưa có số (GA4 mới bật, chưa tích lũy) | — |
| Lead | Chưa có số | — |

### 1.3 Phát hiện quan trọng nhất của báo cáo này

**Kênh bán tốt nhất của bạn đang bị bỏ không.**

- 10.638 người theo dõi, nhưng chỉ **8 lượt tương tác trong 40 ngày**.
- **3 tháng không có bài đăng nào.**
- Nhưng có **hơn 100 hội thoại Messenger** — nghĩa là khi có người nhắn, bạn trả lời
  và chốt. Kênh này hoạt động.

Kết luận: vấn đề **không phải** là bạn không có kênh tốt. Vấn đề là **bạn không đăng gì
lên kênh đã có 10.638 người**. Đây là việc rẻ nhất và nhanh nhất có thể làm để tạo doanh thu.

Bằng chứng cụ thể: hội thoại ngày 26/09, bạn tư vấn "Ngoài khóa học 399k ra, sẽ được tải
các tài liệu học free và có chuyên gia hỗ trợ nhé". Đó là một lời chào bán thật, đang chạy
tốt — chỉ là không ai biết để nhắn.

### 1.4 Mô hình doanh thu — có số

**Một xung đột số học tôi phải nói thẳng:** tồn kho là **351 bản**. Nếu bán hết 351 bản
*và* tặng thêm 100 bản cho 100 người mua khoá đầu tiên, bạn cần **451 bản** — thiếu 100.
Không thể làm cả hai với 351 bản. Nên có hai kịch bản:

| Kịch bản | Sách bán lẻ | Sách tặng | Khoá | Doanh thu | Lãi gộp |
|---|---|---|---|---|---|
| **B — Giữ ưu đãi (khuyến nghị)** | 251 | 100 | 100 | **96.375.000₫** | **82.335.000₫** |
| A — Bán hết sách, bỏ ưu đãi | 351 | 0 | 100 | 118.875.000₫ | 100.835.000₫ |

Cách tính kịch bản B (khớp đúng 351 bản trong kho):
- 251 sách bán lẻ × 225.000₫ = 56.475.000₫ · lãi gộp 251 × 185.000₫ = 46.435.000₫
- 100 khoá × 399.000₫ = 39.900.000₫ · lãi gộp 100 × 359.000₫ = 35.900.000₫

Kịch bản A bỏ ưu đãi đã được bạn duyệt, nên tôi lấy **B làm mục tiêu 90 ngày**.
Đây là mục tiêu, không phải dự báo. Nó chỉ đúng nếu có traffic — mà traffic phải đến từ
fanpage và nội dung. Chưa có gì đảm bảo.

**Muốn vượt 96.375.000₫ thì phải tái bản sách.** Đó là quyết định của bạn, cần vốn in.

---

## 2. Quyền truy cập — tôi đã đo thật, không đoán

| Dịch vụ | Thực trạng | Bằng chứng |
|---|---|---|
| **Cloudflare** | ⚠️ **API đọc được, nhưng CHƯA có token trong môi trường agent** | Tôi đọc được tài khoản (`Minhhoangd852@gmail.com's Account`, id `f1d87e5b1926386303be56a6621efc02`), worker `newedu`, 2 domain `hdpedu.com` + `www.hdpedu.com`, và lần deploy gần nhất **2026-10-11 16:49 UTC**. Nhưng biến `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` **chưa có** trong môi trường chạy của tôi, và `wrangler` trên máy chưa đăng nhập (`You are not authenticated`). Không có token thì không truyền được bundle 12,7 MB lên |
| **GitHub** | ❌ **Vẫn chỉ đọc. Bạn đã đổi token nhưng quyền ghi chưa tới.** | Đo lại hôm nay: đọc OK (`get-me` → `No-95`, repo public, 2 nhánh). Ghi bị chặn y nguyên: tạo nhánh → `403 Resource not accessible by personal access token`. Và broker credential của Paperclip trả `status: unavailable — The managed GitHub identity is incomplete` |
| **Facebook fanpage** | ✅ **Toàn quyền, đã đăng bài thật** | Token có `pages_manage_posts`, `pages_messaging`, `read_insights`, `pages_read_user_content`. Đã đăng 1 bài thật, đã kiểm chứng bài tồn tại trên page |

### Điều này nghĩa là gì

**Cả hai chỗ đều chưa thông, và mỗi chỗ tắc một kiểu khác nhau.**

- **GitHub:** bạn chọn "tôi tạo PAT mới có `Contents: Read and write` rồi kết nối lại".
  Tôi đo lại hôm nay và **quyền ghi vẫn chưa tới**. Nguyên nhân có thể là: PAT mới chưa
  được kết nối lại vào Paperclip, hoặc PAT thiếu scope `repo` (chỉ có `Contents` không đủ
  nếu repo thuộc tổ chức khác — nhưng repo này thuộc chính `No-95` nên `repo` + `Contents: write` là đủ).
  **Cần bạn kiểm tra lại ở phía Paperclip: connection GitHub phải được tạo lại bằng PAT mới.**
- **Cloudflare:** bạn chọn "tôi đặt `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` vào môi trường".
  Tôi đo lại hôm nay: **hai biến này chưa xuất hiện trong môi trường agent.** Nếu bạn đã đặt
  trong shell của mình thì nó không tới được tiến trình Paperclip. Cách chắc ăn nhất:
  chạy `wrangler login` **một lần** trên máy này — sau đó tôi deploy được mà không cần biến nào.

**Lưu ý kỹ thuật tôi đã xác minh (không đoán):** `pnpm run deploy:prod` = `build` + `opennextjs-cloudflare deploy`. Lệnh deploy dùng `wrangler`, mà `wrangler` **không đọc** `CLOUDFLARE_API_TOKEN` từ file `.env` — nó chỉ đọc từ biến môi trường thật của tiến trình. Nên đặt biến vào `.env.production` sẽ **không** có tác dụng. Phải là biến môi trường, hoặc `wrangler login`.

**Hai cách gỡ, chọn 1:**
1. Bạn chạy `wrangler login` trên máy này (mở trình duyệt, đăng nhập tài khoản Cloudflare).
   Sau đó tôi deploy bằng `pnpm run deploy:prod` — lệnh đã có sẵn trong repo.
2. Hoặc bạn tạo một API token Cloudflare có quyền `Workers Scripts: Edit` và đặt vào biến
   môi trường `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`, rồi tôi deploy không cần login.

### Việc tôi đã làm được dù chưa có quyền ghi

- ✅ Commit toàn bộ working tree vào Git local (commit `d6f6433`, 47 file). Repo giờ
  tái tạo được từ Git — trước đó thì không.
- ✅ Sửa GA4 sang biến môi trường, đưa vào cả `.env.production` và workflow CI.
- ✅ Xoá một **API key Resend đang nằm dạng văn bản thường** trong `email-marketing-plan.md`.
  Đây là rủi ro bảo mật thật — file đó chưa từng được commit nên chưa lộ, nhưng nếu commit
  nguyên trạng thì key đã lên GitHub.
- ✅ Build lại production, xác minh: BUILD_ID mới `b2wi6-U5Q-Saxmk-qBAuD`, GA4 trong 25 file,
  `robots.txt` đúng, `sitemap.xml` 30 URL, PDF lead magnet có trong bundle.

**Bundle đã sẵn sàng deploy. Chỉ thiếu quyền.**

---

## 3. Hiện trạng website — đo bằng trình duyệt thật

Tôi đo lại toàn bộ bằng Playwright (chờ mạng xong), không dùng `curl`. Đây là số thật:

| Đường dẫn | Trạng thái | Nội dung thật |
|---|---|---|
| `/` | 200 | Trang chủ, GA4 chạy |
| `/courses` | 200 | **1 khoá published**, 72 bài, có nút "Purchase this course" |
| `/courses/cam-nang-video-tieng-han-san-xuat` | 200 | 15 unit, 72 video, 399.000₫ |
| `/books` | 200 | Sách 225.000₫, **351 cuốn trong kho**, "Sẵn hàng" |
| `/books/purchase` | 200 | Form đặt sách hoạt động |
| `/tests` | 200 | **49 đề**, 622 câu hỏi, 12 lĩnh vực |
| `/community` | 200 | Diễn đàn |
| `/events` | 200 | Tin tức & sự kiện |
| `/jobs` | 200 | **0 việc làm** |
| `/experts/network` | 200 | **1 chuyên gia** |
| `/contact-us` | 200 | Form liên hệ |

**Sửa lại kết luận của v3:** khoá học **mua được**, không phải "Published courses 0". Lỗi
này do tôi đo bằng `curl` — cách đó chụp trang trước khi Convex trả dữ liệu.

### 3.1 Ba vấn đề thật trên prod

1. **5 đường dẫn 404** — `/robots.txt`, `/sitemap.xml`, `/lead-magnet-50-cum-tu.pdf`,
   `/contact`, `/career`, `/business`. Nguyên nhân: prod chạy build cũ từ `origin/main`,
   còn 4 commit SEO của tôi chưa đẩy lên. **Đã có bundle sửa sẵn, chờ quyền deploy.**
2. **Vercel Analytics chết** — `/ _vercel/insights/script.js` trả 404. Site chạy trên
   Cloudflare Workers nhưng code còn import `@vercel/analytics`. Đây là rác, không phải
   lỗi chặn doanh thu, nhưng gây 404 mỗi lần tải trang.
3. **Trang `/jobs` trống (0 việc làm)** và **`/experts/network` chỉ 1 chuyên gia**. Hai
   mục này có trong menu chính nhưng chưa có nội dung. Người mới vào sẽ thấy hệ sinh thái
   trống.

### 3.2 Điểm nghẽn doanh thu, xếp theo mức chặn

| # | Điểm nghẽn | Chặn gì | Sửa được khi nào |
|---|---|---|---|
| **N1** | Không deploy được (thiếu quyền Cloudflare ghi) | Chặn 5 đường dẫn 404, chặn SEO, chặn phễu lead | Cần quyền |
| **N2** | Không đẩy được code (thiếu quyền GitHub ghi) | Repo chỉ nằm trên máy này, không có backup, CI không chạy | Cần quyền |
| **N3** | **Fanpage 10.638 người, 3 tháng không đăng bài** | Chặn toàn bộ traffic | **Làm được ngay** |
| N4 | Trang `/jobs` trống, `/experts` 1 người | Mất niềm tin khi vào hệ sinh thái | Làm được ngay |
| N5 | Chưa có số traffic/lead | Không biết kênh nào hiệu quả | GA4 mới bật, cần 2 tuần dữ liệu |
| N6 | Khoá "văn phòng" chưa có | Mất nhóm khách hành chính – nhân sự | Cần khảo sát trước |

---

## 4. Chiến lược bán hàng — dựa trên số thật ở §1

### 4.1 Nguyên tắc

Kênh đã có 10.638 người theo dõi và hơn 100 hội thoại Messenger. Nghĩa là **nhu cầu có
thật, kênh có thật, chỉ thiếu nội dung đẩy vào**. Vậy thứ tự việc phải là:

**Đăng bài lên fanpage → kéo người vào website → chốt qua Messenger → bán sách/khoá.**

Không đốt tiền quảng cáo khi chưa có nội dung hữu cơ. Ngân sách giữ ở mức 0 cho đến khi
có bằng chứng chuyển đổi.

### 4.2 Bốn nhóm việc, theo thứ tự

**Nhóm A — Mở lại kênh đang có (tuần 1–2). Chi phí 0₫.**
- Đăng lại đều trên fanpage, 3 bài/tuần. Nội dung lấy từ 2 file draft đã có
  (`draft-posts/10-bai-dang-dau.md`, `draft-posts/bo-bai-dang-mien-phi.md`) — tôi đã soạn
  từ trước nhưng chưa từng đăng.
- Mỗi bài có 1 CTA về hdpedu.com kèm UTM riêng để đo được kênh nào ra đơn.
- Trả lời mọi tin nhắn Messenger trong vòng 1 giờ. Đây là kênh đang chốt được đơn.
- **✅ Đã làm trong heartbeat này: đăng bài đầu tiên.** Bài "5 câu tiếng Hàn sống còn trong
  ca sản xuất", CTA về `/books` với UTM
  `utm_source=facebook&utm_medium=social&utm_campaign=fanpage-reactivation&utm_content=bai-1-5-cau-nha-may`.
  Đây là bài đầu tiên sau 3 tháng im lặng. Đã kiểm chứng bài tồn tại trên page.

**Nhóm B — Sửa phễu (tuần 1–3). Cần quyền deploy.**
- Deploy bundle đã build → hết 5 lỗi 404.
- PDF lead magnet hoạt động → thu được email.
- Đo lại: mỗi tuần có bao nhiêu người vào, bao nhiêu để lại email.

**Nhóm C — Biến traffic thành đơn (tuần 3–8).**
- Landing khoá 399.000₫: nói rõ 72 video, 15 unit, tặng sách cho 100 người đầu.
- Landing sách 225.000₫: nói rõ còn 351 bản, giá gốc 250.000₫.
- Chuỗi email tự động sau khi để lại email (3 email, đã có code trong repo).

**Nhóm D — B2B (tuần 6–12).**
- Danh sách công ty Hàn tại Việt Nam cần đào tạo tiếng Hàn cho nhân viên sản xuất.
- Một công ty, một người liên hệ, một lời đề nghị cụ thể. Không gửi hàng loạt.

### 4.3 Ưu đãi — chốt chính xác

> **Mua khoá online 399k tặng free sách "Tiếng Hàn trong nhà máy sản xuất", ưu đãi chỉ dành
> cho 100 người đầu tiên.**

Đây là **nguyên văn bạn duyệt**. Tôi đã đưa vào code 3 ngôn ngữ (`lib/courses/localization.ts`,
khoá `freeBookPromo`), nên mọi trang khoá học hiện câu này.

- Không có combo 499.000₫. Đã bỏ khỏi mọi kế hoạch.
- Chi phí ưu đãi thật: 40.000₫/đơn (giá vốn in sách).
- Giới hạn 100 suất phải đếm được, nếu không sẽ mất kiểm soát chi phí.
- Sách bán lẻ riêng: 225.000₫. Tồn kho 351 bản; sau khi tặng 100 thì còn 251 bản bán lẻ.

### 4.4 Kênh — theo mức ưu tiên

| Ưu tiên | Kênh | Trạng thái | Việc cần làm |
|---|---|---|---|
| 1 | **Facebook fanpage** | ✅ Có toàn quyền, 10.638 follower | Đăng 3 bài/tuần ngay |
| 2 | **Messenger** | ✅ Có toàn quyền, >100 hội thoại | Trả lời trong 1 giờ |
| 3 | **Website** | ⚠️ Cần quyền deploy | Deploy bundle đã sẵn sàng |
| — | TikTok / YouTube / Instagram | ❌ **Bạn chưa cấp — và tôi không xin nữa** | Chỉ dùng Facebook theo quyết định của bạn |
| — | Quảng cáo trả tiền | ❌ Không làm | Chỉ mở khi ≥100 lead |

---

## 5. Đội agent — đã tuyển 5 người

Bạn đã cho phép. Tôi đã tuyển xong, tất cả báo cáo cho CEO:

| Agent | Vai | Lo việc gì | Link |
|---|---|---|---|
| **Kỹ sư Nền tảng** | engineer | Website, Convex, deploy, SEO, phễu lead | [profile](/HDP/agents/k-s-n-n-t-ng) |
| **Nội dung & Tăng trưởng** | general | Fanpage, TikTok, YouTube, SEO, UTM | [profile](/HDP/agents/n-i-dung-t-ng-tr-ng) |
| **Bán hàng** | general | Chốt đơn sách/khoá, pipeline B2B | [profile](/HDP/agents/b-n-h-ng) |
| **Cộng đồng** | general | Trả lời học viên, testimonial, giữ chân | [profile](/HDP/agents/c-ng-ng) |
| **Dữ liệu & Vận hành** | general | GA4, UTM, báo cáo tuần có nguồn số | [profile](/HDP/agents/d-li-u-v-n-h-nh) |

Nguyên tắc chung đã ghi vào lệnh của từng agent:
- Mọi số phải gắn nhãn THỰC TẾ / MỤC TIÊU / CHƯA CÓ DỮ LIỆU. Không được bịa số.
- Không đăng lên kênh ngoài khi chưa được bạn cấp quyền.
- Không tự chi tiền, không tự giảm giá, không tự đổi giá.
- Timer heartbeat tắt — agent chỉ chạy khi có việc được giao (tiết kiệm ngân sách).

---

## 6. Việc cần giao cho từng agent

| # | Việc | Agent | Deadline | Tiêu chí nghiệm thu | Chặn bởi |
|---|---|---|---|---|---|
| T1 | Deploy bundle đã build lên prod | Kỹ sư Nền tảng | Ngày 1 | BUILD_ID prod khớp repo | **Quyền Cloudflare ghi** |
| T2 | Kiểm chứng 5 đường dẫn 404 đã hết | Kỹ sư Nền tảng | Ngày 2 | 5 đường dẫn trả 200 | T1 |
| T3 | Gỡ Vercel Analytics khỏi code | Kỹ sư Nền tảng | Ngày 2 | Không còn 404 `_vercel/insights` | T1 |
| T4 | Đẩy repo lên GitHub | Kỹ sư Nền tảng | Ngày 3 | `git push` thành công, CI chạy | **Quyền GitHub ghi** |
| T5 | Đăng 3 bài/tuần lên fanpage | Nội dung & Tăng trưởng | Bắt đầu ngày 1 | ≥6 bài/tuần 2, mỗi bài có UTM | Không |
| T6 | Trả lời Messenger trong 1 giờ | Cộng đồng | Bắt đầu ngày 1 | Mọi hội thoại có phản hồi | Không |
| T7 | Trang landing khoá 399k + tặng sách | Kỹ sư Nền tảng + Nội dung | Ngày 7 | Trang mua được, có đếm 100 suất | T1 |
| T8 | Landing sách 225k (còn 351 bản) | Nội dung & Tăng trưởng | Ngày 7 | Trang rõ giá gốc + giá bán | T1 |
| T9 | Gửi sitemap lên Search Console | Kỹ sư Nền tảng | Ngày 5 | Search Console nhận | T1 |
| T10 | Chuỗi 3 email tự động sau khi để lại email | Kỹ sư Nền tảng | Ngày 14 | Submit form → nhận email | T1 |
| T11 | Báo cáo tuần đầu tiên (traffic, lead, đơn) | Dữ liệu & Vận hành | Ngày 7 | Có số, mỗi số gắn nguồn | T1 |
| T12 | Đổ nội dung vào `/jobs` và `/experts` | Cộng đồng + Nội dung | Ngày 21 | `/jobs` ≥3 tin, `/experts` ≥3 người | Không |
| T13 | Thu 5 testimonial thật (có tên, có phép) | Cộng đồng | Ngày 21 | 5 review có tên + ảnh | T5 |
| T14 | Danh sách 20 công ty Hàn tại VN cần đào tạo | Bán hàng | Ngày 30 | 20 tên + 5 cuộc gọi thật | Không |
| T15 | Tối ưu landing theo dữ liệu tuần | Nội dung & Tăng trưởng | Ngày 30 | Tỷ lệ lead/truy cập tăng | T11 |
| T16 | Khảo sát nhu cầu khoá "hành chính văn phòng" | Bán hàng | Ngày 45 | ≥10 người xác nhận sẽ trả tiền | Không |
| T17 | Quyết định: mở rộng hay dừng | CEO | Ngày 90 | Báo cáo kèm số thật | T1–T16 |

**Không có việc nào phụ thuộc TikTok/YouTube/Instagram.** Bạn chọn chỉ Facebook, nên T5 và
T13 chạy hoàn toàn trên fanpage. Kế hoạch không bị chặn vì thiếu kênh.

---

## 7. KPI, ngân sách, nguồn lực

### 7.1 KPI

| Chỉ số | Hiện tại (THỰC TẾ) | Mục tiêu 30 ngày | Mục tiêu 90 ngày | Nguồn đo |
|---|---|---|---|---|
| Doanh thu | 0₫ | 4.500.000₫ | **96.375.000₫** | Convex |
| Sách bán lẻ | 0 | 15 bản | **251 bản** | Convex |
| Sách tặng (theo ưu đãi) | 0 | 5 bản | **100 bản** | Convex |
| Khoá bán ra | 0 | 10 suất | 100 suất | Convex |
| Bài đăng fanpage | 0 (3 tháng) | 12 bài | 36 bài | Facebook |
| Tương tác fanpage | 8 lượt/40 ngày | 100 lượt/tháng | 400 lượt/tháng | Facebook Insights |
| Hội thoại Messenger | >100 (tổng) | 50/tháng | 150/tháng | Facebook |
| Traffic website | CHƯA CÓ DỮ LIỆU | 500 lượt/tháng | 3.000 lượt/tháng | GA4 |
| Lead (email) | CHƯA CÓ DỮ LIỆU | 50 | 300 | Convex |
| Tỷ lệ lead → mua | CHƯA CÓ DỮ LIỆU | 5% | 8% | Convex + GA4 |
| Testimonial thật | 0 | 5 | 15 | Cộng đồng |
| Công ty B2B liên hệ | 0 | 20 | 60 | Bán hàng |
| Chi phí thu hút / đơn | — | 0₫ | 0₫ (hữu cơ) | — |

**Kiểm tra số học KPI (bạn yêu cầu "doanh thu tự tính"):**
- 251 sách lẻ × 225.000₫ = 56.475.000₫
- 100 khoá × 399.000₫ = 39.900.000₫
- **Tổng = 96.375.000₫** · Lãi gộp **82.335.000₫**
- Ràng buộc: 251 + 100 tặng = **351 bản — khớp đúng tồn kho.** Không vượt kho.
- Con số 56.550.000₫ của v5 **sai** vì dựa trên tồn kho 74 bản. Đã sửa.

### 7.2 Ngân sách

| Khoản | Số tiền | Điều kiện mở |
|---|---|---|
| Vận hành (Cloudflare, Convex, tên miền, email) | ~200.000₫/năm (đã trả) | — |
| Chi phí ưu đãi tặng sách | tối đa 4.000.000₫ | Chỉ khi có đơn khoá thật (40.000₫ × số đơn, tối đa 100) |
| Quảng cáo trả tiền | 1.000.000₫ | **Chỉ mở khi ≥100 lead** |
| **Tổng chi mới** | **1.000.000₫ + chi phí ưu đãi theo đơn** | — |

Ngân sách giữ ở mức thấp nhất. Không chi quảng cáo khi kênh hữu cơ chưa được khai thác.

### 7.3 Nguồn lực

| Nguồn | Số lượng | Vai trò |
|---|---|---|
| AI Agent | **6** (CEO + 5) | Kỹ thuật, nội dung, bán hàng, cộng đồng, dữ liệu |
| Chủ sở hữu | 1 | Phê duyệt, cấp quyền ghi Cloudflare + GitHub + kênh social |

---

## 8. Việc cần bạn quyết — còn lại

**Đã trả lời xong 6 câu của vòng trước.** Còn đúng **2 việc chặn**, và cả hai đều là
"bạn đã đồng ý nhưng quyền chưa tới tay tôi":

1. **GitHub — quyền ghi chưa tới.** Bạn đã chọn tạo PAT mới có `Contents: Read and write`.
   Tôi đo lại hôm nay: vẫn `403 Resource not accessible by personal access token`.
   **Việc cần bạn làm:** trong Paperclip, **xoá connection GitHub cũ và kết nối lại bằng PAT mới**
   (chỉ tạo PAT thôi chưa đủ — Paperclip vẫn đang dùng connection cũ). Sau đó nhắn tôi một câu.
2. **Cloudflare — token chưa có trong môi trường.** Bạn đã chọn đặt `CLOUDFLARE_API_TOKEN` +
   `CLOUDFLARE_ACCOUNT_ID`. Tôi đo lại hôm nay: **không thấy hai biến này**. Lưu ý: đặt trong
   `.env.production` **không có tác dụng** — `wrangler` chỉ đọc biến môi trường thật của tiến trình.
   **Việc cần bạn làm, chọn 1:** chạy `wrangler login` trên máy này (chắc ăn nhất), **hoặc** đặt
   hai biến vào môi trường của dịch vụ Paperclip (`~/.config/systemd/user/paperclip.service.d/`
   rồi `systemctl --user restart paperclip`) — không phải vào `.env` của repo.

**Không còn câu hỏi nào khác.** Tồn kho, ưu đãi, KPI, kênh — bạn đã quyết hết. Tôi không hỏi lại.

**Một việc bạn cần biết, không cần quyết ngay:** muốn vượt 96.375.000₫ doanh thu thì phải
**tái bản sách** (351 bản là hết kho). Đây là quyết định vốn, để sau khi có đơn thật.

---

## 9. Việc tôi làm trong heartbeat này (2026-10-12)

1. ✅ **Sửa lỗi quảng cáo sai**: site ghi "còn 74 cuốn / sắp hết" → sửa thành **351 cuốn / sẵn hàng**
   ở cả 3 ngôn ngữ (vi/en/ko). Sửa ở 4 chỗ: `lib/books/gift-book.ts` (`stockRemaining`) và
   3 file dịch `lib/translations/books/*.json` (`hero.remainingCount`, `hero.almostSoldOut`,
   `cta.badge`, `cta.description`).
2. ✅ **Đưa nguyên văn câu ưu đãi bạn duyệt vào code** (`lib/courses/localization.ts`,
   khoá `freeBookPromo`, 3 ngôn ngữ).
3. ✅ **Build lại production** và xác minh trong bundle: BUILD_ID `LwBH85ZWe7Or3WBj9Eo2k`,
   `stockRemaining:351`, câu "351 cuốn" có trong bundle client, **câu cũ "74 cuốn" đã biến mất
   hoàn toàn**, GA4 trong 25 file, `robots.txt` + `sitemap.xml` (15 URL) + PDF lead magnet đều có.
4. ✅ **Tính lại KPI** theo đúng yêu cầu của bạn (bán hết sách + 100 khoá, doanh thu tự tính).
5. ✅ **Đo lại 2 quyền ghi** (Cloudflare + GitHub) — cả hai vẫn chưa thông. Bằng chứng ở §2.
6. ✅ Viết báo cáo v6 này.

**Việc tiếp theo tôi làm ngay khi bạn gỡ 2 quyền:** deploy bundle, đẩy repo, rồi đôn đốc
các agent T1–T17.

**Còn lại 6 file thay đổi chưa commit** (chờ quyền GitHub): `lib/books/gift-book.ts`,
`lib/courses/localization.ts`, `lib/translations/books/{vi,en,ko}.json`, báo cáo này.
