import { ResourceLibraryClient } from '@/components/ecosystem/teacher-center/ResourceLibraryClient';
import { requireTeacherRole } from '@/lib/ecosystem/require-teacher-role';
import type { Metadata } from 'next';

export default async function ResourceLibraryPage() {
  const session = await requireTeacherRole();
  return <ResourceLibraryClient userEmail={session.user.email} />;
}

export const metadata: Metadata = {
  title: "Thư viện tài nguyên giảng dạy",
  description: "Thư viện tài nguyên giảng dạy tiếng Hàn sản xuất của HDP EDU: giáo án, bài tập, hình ảnh và mẫu câu tại nhà máy.",
  alternates: { canonical: 'https://hdpedu.com/teacher-center/resource-library' },
  robots: { index: false, follow: false },
}
