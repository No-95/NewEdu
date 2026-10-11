// Promotional email templates for HDP EDU

export const promoEmails = [
  {
    trigger: "promo_broadcast",
    subject: "Ưu đãi đặc biệt — Giảm 30% khóa học Korean",
    vi: {
      title: "Early-bird: 30% OFF",
      body: "Đăng ký trước {deadline} được giảm 30% cho tất cả khóa A1-B2. Á dụng cho học viên mới.",
      cta: "Đăng ký ngay",
    },
    en: {
      title: "30% OFF all Korean courses",
      body: "Register before {deadline}. For new students only.",
      cta: "Register now",
    },
  },
  {
    trigger: "promo_new_course",
    subject: "Khóa học mới: {courseName}",
    vi: {
      title: "Mở bán khóa mới",
      body: "{courseName} — {courseDesc}. Giáo viên {teacherName}. Chỉ {price}VNĐ.",
      cta: "Xem chi tiết",
    },
    en: {
      title: "New course available",
      body: "{courseName} — {courseDesc}. Only {price}VND.",
      cta: "See details",
    },
  },
  {
    trigger: "promo_seasonal",
    subject: "🎄 Korean Christmas Special — Free lesson",
    vi: {
      title: "Khóa special mùa lễ",
      body: "Miễn phí 1 lesson \"Korean for Travel\" — chỉ trong tuần này.",
      cta: "Nhận free lesson",
    },
    en: {
      title: "Free travel Korean lesson",
      body: "This week only: free \"Korean for Travel\" lesson.",
      cta: "Claim free lesson",
    },
  },
];
