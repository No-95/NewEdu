// Course reminder emails for HDP EDU

export const courseReminders = [
  {
    delayHours: 72,
    trigger: "course_starts_3d",
    subject: "Khóa học bắt đầu sau 3 ngày ⏰",
    vi: {
      title: "Sắp bắt đầu rồi",
      body: "Khóa \"{courseName}\" mở cửa 3 ngày nữa. Giáo viên: {teacherName}. Đã có {studentCount} học viên.",
      cta: "Ôn tập tài liệu",
    },
    en: {
      title: "Starts in 3 days",
      body: "\"{courseName}\" begins in 3 days. Teacher: {teacherName}. {studentCount} students enrolled.",
      cta: "Review materials",
    },
  },
  {
    delayHours: 24,
    trigger: "course_starts_1d",
    subject: "Ngày mai bắt đầu — chuẩn bị sẵn sàng",
    vi: {
      title: "Ngày mai đã đến",
      body: "Khóa \"{courseName}\" bắt đầu lúc {startTime}. Link vào lớp: {classLink}.",
      cta: "Vào lớp ngay",
    },
    en: {
      title: "Tomorrow is the day",
      body: "\"{courseName}\" starts at {startTime}. Join link: {classLink}.",
      cta: "Join class",
    },
  },
  {
    delayHours: 168,
    trigger: "course_reengage",
    subject: "Bạn đã bỏ lỡ khóa học — quay lại?",
    vi: {
      title: "Chúng tôi nhớ bạn",
      body: "Khóa \"{courseName}\" đã bắt đầu. Bạn có muốn tham gia vòng tiếp theo không?",
      cta: "Đăng ký vòng mới",
    },
    en: {
      title: "Missed the cohort?",
      body: "Next round of \"{courseName}\" opens soon. Want in?",
      cta: "Join next cohort",
    },
  },
];
