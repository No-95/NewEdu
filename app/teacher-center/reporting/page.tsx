import { ReportingClient } from '@/components/ecosystem/teacher-center/ReportingClient';
import { requireTeacherRole } from '@/lib/ecosystem/require-teacher-role';

export default async function ReportingPage() {
  const session = await requireTeacherRole();
  return <ReportingClient userEmail={session.user.email} />;
}