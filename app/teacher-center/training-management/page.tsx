import { TrainingManagementClient } from '@/components/ecosystem/teacher-center/TrainingManagementClient';
import { requireTeacherRole } from '@/lib/ecosystem/require-teacher-role';
import type { Metadata } from 'next';

export default async function TrainingManagementPage() {
  const session = await requireTeacherRole();
  return <TrainingManagementClient userEmail={session.user.email} />;
}

export const metadata: Metadata = {
  title: "Quản lý đào tạo",
  description: "Quản lý chương trình đào tạo tiếng Hàn sản xuất trên HDP EDU: lớp, lịch học, giảng viên và kết quả đầu ra.",
  alternates: { canonical: 'https://hdpedu.com/teacher-center/training-management' },
  robots: { index: false, follow: false },
}
