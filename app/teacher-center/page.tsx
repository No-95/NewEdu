import { TeacherCenterLandingClient } from '@/components/ecosystem/teacher-center/TeacherCenterLandingClient';
import type { Metadata } from 'next';

export default function TeacherCenterPage() {
  return <TeacherCenterLandingClient />;
}

export const metadata: Metadata = {
  title: "Trung tâm giáo viên HDP EDU",
  description: "Khu vực dành cho giáo viên HDP EDU: quản lý khóa học, học viên, tài nguyên giảng dạy và báo cáo.",
  alternates: { canonical: 'https://hdpedu.com/teacher-center' },
  robots: { index: false, follow: false },
}
