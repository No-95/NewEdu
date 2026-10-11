# Offer & CTA cho landing hdpedu.com
## Mục: chuyển visitor → đăng ký khoá Cẩm nang Video: Tiếng Hàn Sản xuất

---

### Offer (lời đề nghị)
> **"Cẩm nang Video: Tiếng Hàn Sản xuất — 72 bài giảng, 15 unit, 399.000 ₫"**
> 
> Học tiếng Hàn từ zero đến giao tiếp được trong nhà máy, xưởng sản xuất Hàn Quốc. Mỗi bài 15–20 phút, phát video HLS, học mọi lúc mọi nơi.

### CTA chính (trên landing)
- **Nút lớn:** "Đăng ký học thử miễn phí — Bài 1: Chào hỏi nhà máy"
- **Nút phụ:** "Mua khoá ngay — 399.000 ₫"
- **Dưới nút:** "Đã có 72 bài giảng sẵn sàng · Phát qua HLS · Học trên điện thoại"

### CTA thứ cấp (giữa bài viết, cuối trang, popup sau 60s)
- "Bạn đã biết bao nhiêu cụm từ tiếng Hàn nhà máy? [Làm bài test] →"
- "Nhận miễn phí PDF: 50 cụm từ giao tiếp nhà máy phải biết" (dùng để capture email)
- **Lưu ý:** `/blog` và `/free-lessons` hiện trả **404** → chỉ dùng 2 CTA thứ cấp này SAU KHI kỹ sư thêm route. Trước đó, mọi CTA trỏ thẳng `/courses/cam-nang-video-tieng-han-san-xuat`.

### Copy landing page (dành cho kỹ sư)
- Hero: "Tiếng Hàn Sản Xuất — Học Để Làm Việc Thật"
- Subhero: "72 bài giảng thực tế · Phát HLS · 399.000 ₫ · Học mọi lúc"
- Feature 1: "Không cần TOPIK — học từ 0"
- Feature 2: "Nội dung nhà máy thật: gọi máy, an toàn, giao ca"
- Feature 3: "Video HLS phát mượt trên mobile"
- Social proof (chỉ dùng khi có người thật): thay số marketing bằng số liệu thật

---

## Bộ từ khoá SEO cho robots.txt / sitemap.xml / nội dung trang

### Từ khoá chính (target)
- tiếng hàn sản xuất
- học tiếng hàn nhà máy
- tiếng hàn công nhân
- tiếng hàn giao tiếp nhà máy
- khóa học tiếng hàn sản xuất
- học tiếng hàn online
- tiếng hàn cho người đi làm

### Từ khoá phụ (long-tail)
- học tiếng hàn sau ca đêm
- cụm từ tiếng hàn nhà máy hay nhất
- tiếng hàn an toàn sản xuất
- học tiếng hàn qua video
- khoá tiếng hàn 399k
- tiếng hàn cho công nhân việt nam
- học tiếng hàn để đi xuất khẩu lao động

### Từ khoá brand
- HDP EDU
- Tiếng Hàn Chuyên Ngành HDP
- hdpedu.com
- tienghan.giaotiep.chuyennganh

### Cấu trúc URL đề xuất cho SEO
- / → landing
- /courses → danh sách khoá
- /courses/cam-nang-video-tieng-han-san-xuat → trang khoá
- /blog → bài viết SEO
- /blog/tieu-de-chua-tu-khoa → bài chi tiết
- /free-lessons → bài học miễn phí (lead magnet)
- /community → cộng đồng

### robots.txt đề xuất (kỹ sư nền tảng thêm)
```
User-agent: *
Allow: /
Allow: /courses
Allow: /blog
Allow: /free-lessons
Disallow: /api/
Disallow: /auth/
Disallow: /dashboard/

Sitemap: https://hdpedu.com/sitemap.xml
```

### sitemap.xml đề xuất
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://hdpedu.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://hdpedu.com/courses</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://hdpedu.com/courses/cam-nang-video-tieng-han-san-xuat</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://hdpedu.com/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://hdpedu.com/free-lessons</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

---

### Ghi chú
- **Kiểm chứng lại 05/10/2026 (HTTP thật):** `/` 200, `/courses` 200, `/courses/cam-nang-video-tieng-han-san-xuat` 200; `robots.txt` **404**, `sitemap.xml` **404**, `/blog` **404**, `/free-lessons` **404**.
- robots.txt + sitemap.xml → kỹ sư nền tảng thêm (HDPAAA-3). Nội dung từ khoá đã có ở §SEO.
- Landing đang hiện số marketing 50K+ cộng đồng, 10K+ học viên — cần thay bằng số liệu thật khi có. **Không dùng làm bằng chứng kết quả.**
- Màu sắc/thương hiệu: kiểm tra `public/homepage/` và `public/hdp-logo.png` để đảm bảo nhất quán.
- Khoá đích (đã xác nhận trên prod): `Cẩm nang Video: Tiếng Hàn Sản xuất`, slug `cam-nang-video-tieng-han-san-xuat`, 72 bài / 15 unit, giá 399.000 ₫.
