import { interpolateTemplate } from './email';

type Locale = 'en' | 'vi' | 'ko';

type NotificationCopy = { title: string; body: string; cta?: string };

const COPY: Record<Locale, Record<string, NotificationCopy>> = {
  en: {
    application_stage: { title: 'Application update', body: 'Your application for {position} moved to {stage}.' },
    application_rejected: { title: 'Application update', body: 'Your application for {position} was not selected at this time.' },
    application_submitted: { title: 'Application submitted', body: 'You applied for {jobTitle}.' },
    new_applicant: { title: 'New job applicant', body: '{applicantName} applied for {jobTitle}.' },
    homework_assigned: { title: 'New homework assigned', body: '{title}' },
    homework_completed: { title: 'Homework completed', body: '{learnerName} completed "{title}".' },
    consultation_request: { title: 'New consultation request', body: '{requesterName}: {topic}' },
    consultation_accepted: { title: 'Consultation accepted', body: 'Your request "{topic}" was accepted.' },
    consultation_closed: { title: 'Consultation closed', body: 'Your request "{topic}" was closed.' },
    consultation_scheduled: { title: 'Consultation scheduled', body: 'Your consultation "{topic}" is scheduled for {scheduledAt}.' },
    consultation_reminder: { title: 'Consultation reminder', body: 'Your consultation "{topic}" starts at {scheduledAt}.' },
    teacher_accepted: { title: 'Teacher application accepted', body: 'Welcome! Open your teacher dashboard to get started.' },
    teacher_rejected: { title: 'Teacher application update', body: 'Your teacher application was not approved at this time.' },
    expert_accepted: { title: 'Expert application accepted', body: 'Complete your expert profile to appear on the network.' },
    direct_message: { title: 'New message', body: '{senderName}: {preview}' },
  },
  vi: {
    application_stage: { title: 'Cập nhật đơn ứng tuyển', body: 'Đơn {position} chuyển sang {stage}.' },
    application_rejected: { title: 'Cập nhật đơn ứng tuyển', body: 'Đơn {position} chưa được chọn lần này.' },
    application_submitted: { title: 'Đã nộp đơn', body: 'Bạn đã ứng tuyển {jobTitle}.' },
    new_applicant: { title: 'Ứng viên mới', body: '{applicantName} ứng tuyển {jobTitle}.' },
    homework_assigned: { title: 'Bài tập mới', body: '{title}' },
    homework_completed: { title: 'Hoàn thành bài tập', body: '{learnerName} đã hoàn thành "{title}".' },
    consultation_request: { title: 'Yêu cầu tư vấn mới', body: '{requesterName}: {topic}' },
    consultation_accepted: { title: 'Tư vấn được chấp nhận', body: 'Yêu cầu "{topic}" đã được chấp nhận.' },
    consultation_closed: { title: 'Tư vấn đã đóng', body: 'Yêu cầu "{topic}" đã đóng.' },
    consultation_scheduled: { title: 'Đã lên lịch tư vấn', body: 'Tư vấn "{topic}" vào lúc {scheduledAt}.' },
    consultation_reminder: { title: 'Nhắc lịch tư vấn', body: 'Tư vấn "{topic}" bắt đầu lúc {scheduledAt}.' },
    teacher_accepted: { title: 'Đơn giáo viên được duyệt', body: 'Chào mừng! Mở bảng điều khiển giáo viên để bắt đầu.' },
    teacher_rejected: { title: 'Cập nhật đơn giáo viên', body: 'Đơn giáo viên chưa được duyệt lần này.' },
    expert_accepted: { title: 'Đơn chuyên gia được duyệt', body: 'Hoàn thiện hồ sơ chuyên gia để xuất hiện trên mạng lưới.' },
    direct_message: { title: 'Tin nhắn mới', body: '{senderName}: {preview}' },
  },
  ko: {
    application_stage: { title: '지원서 업데이트', body: '{position} 지원이 {stage} 단계로 이동했습니다.' },
    application_rejected: { title: '지원서 업데이트', body: '{position} 지원이 이번에 선정되지 않았습니다.' },
    application_submitted: { title: '지원 완료', body: '{jobTitle}에 지원했습니다.' },
    new_applicant: { title: '새 지원자', body: '{applicantName}님이 {jobTitle}에 지원했습니다.' },
    homework_assigned: { title: '새 숙제', body: '{title}' },
    homework_completed: { title: '숙제 완료', body: '{learnerName}님이 "{title}"을(를) 완료했습니다.' },
    consultation_request: { title: '새 상담 요청', body: '{requesterName}: {topic}' },
    consultation_accepted: { title: '상담 수락됨', body: '"{topic}" 요청이 수락되었습니다.' },
    consultation_closed: { title: '상담 종료', body: '"{topic}" 요청이 종료되었습니다.' },
    consultation_scheduled: { title: '상담 일정 확정', body: '"{topic}" 상담이 {scheduledAt}에 예정되어 있습니다.' },
    consultation_reminder: { title: '상담 알림', body: '"{topic}" 상담이 {scheduledAt}에 시작됩니다.' },
    teacher_accepted: { title: '강사 신청 승인', body: '환영합니다! 강사 대시보드에서 시작하세요.' },
    teacher_rejected: { title: '강사 신청 업데이트', body: '강사 신청이 이번에 승인되지 않았습니다.' },
    expert_accepted: { title: '전문가 신청 승인', body: '전문가 프로필을 완성하여 네트워크에 표시하세요.' },
    direct_message: { title: '새 메시지', body: '{senderName}: {preview}' },
  },
};

const CTA: Record<Locale, string> = {
  en: 'Open HDP EDU',
  vi: 'Mở HDP EDU',
  ko: 'HDP EDU 열기',
};

export function formatNotificationEmailCopy(
  type: string,
  locale: Locale | undefined,
  params?: Record<string, string>
) {
  const lang: Locale = locale && COPY[locale] ? locale : 'en';
  const entry = COPY[lang][type] ?? COPY.en[type];
  if (!entry) return null;

  return {
    title: interpolateTemplate(entry.title, params),
    body: interpolateTemplate(entry.body, params),
    ctaLabel: CTA[lang],
  };
}
