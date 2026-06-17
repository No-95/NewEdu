import { AdminApplicationsClient } from '@/components/admin/AdminApplicationsClient';
import { requireAdminRole } from '@/lib/ecosystem/require-admin-role';

export default async function AdminApplicationsPage() {
  const session = await requireAdminRole();
  return <AdminApplicationsClient userEmail={session.user.email} />;
}
