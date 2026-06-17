import { AdmissionCrmClient } from '@/components/ecosystem/teacher-center/AdmissionCrmClient';
import { requireTeacherRole } from '@/lib/ecosystem/require-teacher-role';

export default async function AdmissionCrmPage() {
  const session = await requireTeacherRole();
  return <AdmissionCrmClient userEmail={session.user.email} />;
}