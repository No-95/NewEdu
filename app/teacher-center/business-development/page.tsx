import { BusinessDevelopmentClient } from '@/components/ecosystem/teacher-center/BusinessDevelopmentClient';
import { requireTeacherRole } from '@/lib/ecosystem/require-teacher-role';

export default async function BusinessDevelopmentPage() {
  const session = await requireTeacherRole();
  return <BusinessDevelopmentClient userEmail={session.user.email} />;
}