import { TeacherCoursesClient } from '@/components/ecosystem/teacher-center/TeacherCoursesClient';
import { requireTeacherRole } from '@/lib/ecosystem/require-teacher-role';

export default async function TeacherCoursesPage() {
  const session = await requireTeacherRole();
  return <TeacherCoursesClient userEmail={session.user.email} />;
}
