import { TeacherCoursesClient } from '@/components/ecosystem/teacher-center/TeacherCoursesClient';
import { requireTeacherRole } from '@/lib/ecosystem/require-teacher-role';
import type { Metadata } from 'next';

export default async function TeacherCoursesPage() {
  const session = await requireTeacherRole();
  return <TeacherCoursesClient userEmail={session.user.email} />;
}

export const metadata: Metadata = {
  title: "Quản lý khóa học",
  description: "Quản lý nội dung khoá học trên HDP EDU: bài giảng, unit, học viên và tiến độ hoàn thành.",
  alternates: { canonical: 'https://hdpedu.com/teacher-center/courses' },
  robots: { index: false, follow: false },
}
