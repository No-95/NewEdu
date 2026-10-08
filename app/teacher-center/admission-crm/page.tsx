import { AdmissionCrmClient } from '@/components/ecosystem/teacher-center/AdmissionCrmClient';
import { requireTeacherRole } from '@/lib/ecosystem/require-teacher-role';
import type { Metadata } from 'next';

export default async function AdmissionCrmPage() {
  const session = await requireTeacherRole();
  return <AdmissionCrmClient userEmail={session.user.email} />;
}

export const metadata: Metadata = {
  title: "CRM tuyển sinh",
  description: "Công cụ CRM tuyển sinh của HDP EDU: theo dõi học viên tiềm năng, tư vấn và chuyển đổi đăng ký khoá học.",
  alternates: { canonical: 'https://hdpedu.com/teacher-center/admission-crm' },
  robots: { index: false, follow: false },
}
