# Thiết lập kênh & yêu cầu quyền truy cập — Luồng B HDP EDU

Cập nhật: 2026-10-05 · Tác giả: GrowthContent · Task: [HDPAAA-4](/HDPAAA/issues/HDPAAA-4)

> Nguyên tắc: chỉ đăng khi có quyền truy cập tài khoản do **chủ sở hữu** cấp. Không dùng tài khoản cá nhân ngoài danh sách.
> Không dán khoá/token/mật khẩu vào tệp hay bình luận. Quyền cấp qua kênh an toàn của Paperclip.

---

## 1. Trạng thái kênh

| Kênh | Trạng thái | Cần gì | Ai cấp | Đo bằng |
|---|---|---|---|---|
| **TikTok** | Chưa có tài khoản (chưa kiểm chứng) | Tài khoản TikTok Business + mật khẩu hoặc quyền quản lý | Chủ sở hữu | UTM `utm_source=tiktok` + TikTok Analytics |
| **YouTube Shorts** | Chưa có kênh (chưa kiểm chứng) | Kênh YouTube + quyền upload (OAuth hoặc brand account) | Chủ sở hữu | UTM `utm_source=youtube` + YouTube Studio |
| **Facebook Reels** | **Có fanpage**: "Tiếng Hàn Chuyên Ngành HDP" (`tienghan.giaotiep.chuyennganh`) | Quyền đăng bài/Reels trên fanpage (Page role) | Chủ sở hữu | UTM `utm_source=facebook` + Meta Business Suite |
| **Messenger auto** | **Đang chạy**: `/home/n00bie/workspace/hdpedu-messenger-auto`, mỗi giờ 08:00–21:30 VN | Đã có | — | Log trả lời + đánh dấu khách nóng |
| **SEO (Google)** | hdpedu.com live; `robots.txt`+`sitemap.xml` **404** | Kỹ sư nền tảng thêm 2 tệp (HDPAAA-3) | PlatformEngineer | Google Search Console |
| **Cộng đồng** | Nhóm FB / forum (chưa xác định danh sách) | Danh sách nhóm + quyền đăng (thường là thành viên) | Chủ sở hữu / GrowthContent tự tham gia | UTM `utm_source=community&utm_medium=<nhom>` |
| **Đối tác** | Chưa có đối tác ký kết | Đối tác chia sẻ nội dung + link affiliate | Chủ sở hữu / CEO | UTM `utm_source=partner&utm_medium=<ma>` |

## 2. Việc cần chủ sở hữu cấp (báo CEO)

Để đăng được nội dung thật cần **quyền truy cập tài khoản kênh**:
1. TikTok — tài khoản Business + quyền đăng.
2. YouTube — kênh + quyền upload.
3. Facebook — xác nhận quyền đăng Reels trên fanpage "Tiếng Hàn Chuyên Ngành HDP".

→ Đã tạo task con báo CEO xin từ chủ sở hữu (xem bình luận cuối [HDPAAA-4](/HDPAAA/issues/HDPAAA-4)).

## 3. Kênh có thể chạy ngay không cần cấp mới

- **Facebook fanpage** (đã có fanpage, cần xác nhận quyền đăng).
- **SEO blog** — chờ kỹ sư thêm route `/blog` (hiện 404) + `robots.txt`/`sitemap.xml`.
- **Messenger auto** — đã chạy, dùng để trả lời comment/Inbox dẫn về `/courses`.

## 4. Thứ tự bật kênh (ưu tiên)

1. Facebook Reels (fanpage đã có sẵn) → chạy trước.
2. SEO (khi kỹ sư thêm robots/sitemap/blog).
3. TikTok + YouTube Shorts (sau khi được cấp tài khoản).
4. Cộng đồng + đối tác (chạy song song, cần danh sách).
