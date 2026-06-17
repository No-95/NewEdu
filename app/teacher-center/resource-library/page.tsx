import { ResourceLibraryClient } from '@/components/ecosystem/teacher-center/ResourceLibraryClient';
import { requireTeacherRole } from '@/lib/ecosystem/require-teacher-role';

export default async function ResourceLibraryPage() {
  const session = await requireTeacherRole();
  return <ResourceLibraryClient userEmail={session.user.email} />;
}
