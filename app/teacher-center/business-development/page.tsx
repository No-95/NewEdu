import { BusinessDevelopmentClient } from '@/components/ecosystem/teacher-center/BusinessDevelopmentClient';
import { requireTeacherRole } from '@/lib/ecosystem/require-teacher-role';
import type { Metadata } from 'next';

export default async function BusinessDevelopmentPage() {
  const session = await requireTeacherRole();
  return <BusinessDevelopmentClient userEmail={session.user.email} />;
}

export const metadata: Metadata = {
  title: "Phát triển kinh doanh",
  description: "Công cụ phát triển kinh doanh cho giáo viên HDP EDU: quản lý cơ hội hợp tác, đối tác doanh nghiệp và kế hoạch tăng trưởng.",
  alternates: { canonical: 'https://hdpedu.com/teacher-center/business-development' },
  robots: { index: false, follow: false },
}
