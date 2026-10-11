// Welcome email sequence for HDP EDU new leads
// Triggers: lead sign-up → 24h → 72h

export const welcomeEmails = [
  {
    delayHours: 0,
    trigger: "lead_signup",
    subject: "Chào mừng đến HDP EDU 🎉",
    vi: {
      title: "Chào mừng đến HDP EDU",
      body: "Cảm ơn bạn đã đăng ký. HDP EDU là nền tảng giáo dục Korean language cho người Việt. Khóa học đầu tiên: Korean Basics A1 — bắt đầu khi bạn sẵn sàng.",
      cta: "Bắt đầu học thử",
    },
    en: {
      title: "Welcome to HDP EDU",
      body: "Thanks for signing up. HDP EDU is the Korean language platform for Vietnamese learners. Start with Korean Basics A1.",
      cta: "Start free lesson",
    },
  },
  {
    delayHours: 24,
    trigger: "welcome_24h",
    subject: "Sẵn sàng bắt đầu học Korean?",
    vi: {
      title: "Bắt đầu hành trình Korean",
      body: "Bạn đã đăng ký 24h rồi. Hãy làm bài test đầu vào để chúng tôi sắp xếp đúng trình độ. Miễn phí — không yêu cầu thẻ tín dụng.",
      cta: "Làm bài test đầu vào",
    },
    en: {
      title: "Ready to start learning Korean?",
      body: "Take your free placement test. No credit card needed.",
      cta: "Take placement test",
    },
  },
  {
    delayHours: 72,
    trigger: "welcome_72h",
    subject: "Học viên HDP EDU đang chờ bạn 🤝",
    vi: {
      title: "Cộng đồng 2,000+ học viên",
      body: "85% học viên hoàn thành A1 trong 8 tuần. Top khóa: Korean for Business, TOPIK Prep, K-Drama Korean.",
      cta: "Xem khóa học phổ biến",
    },
    en: {
      title: "2,000+ Vietnamese learners already here",
      body: "85% complete A1 in 8 weeks. Popular: Korean for Business, TOPIK Prep, K-Drama Korean.",
      cta: "Browse courses",
    },
  },
];
