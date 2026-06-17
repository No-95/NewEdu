import { TrainingManagementClient } from '@/components/ecosystem/teacher-center/TrainingManagementClient';
import { requireTeacherRole } from '@/lib/ecosystem/require-teacher-role';

export default async function TrainingManagementPage() {
  const session = await requireTeacherRole();
  return <TrainingManagementClient userEmail={session.user.email} />;
}
