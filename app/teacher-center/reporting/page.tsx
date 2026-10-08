import { ReportingClient } from '@/components/ecosystem/teacher-center/ReportingClient';
import { requireTeacherRole } from '@/lib/ecosystem/require-teacher-role';
import type { Metadata } from 'next';

export default async function ReportingPage() {
  const session = await requireTeacherRole();
  return <ReportingClient userEmail={session.user.email} />;
}

export const metadata: Metadata = {
  title: "Báo cáo giảng dạy",
  description: "Báo cáo giảng dạy và học tập trên HDP EDU: tỷ lệ hoàn thành, điểm kiểm tra và mức độ tương tác của học viên.",
  alternates: { canonical: 'https://hdpedu.com/teacher-center/reporting' },
  robots: { index: false, follow: false },
}
