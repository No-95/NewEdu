import { HrManagementClient } from '@/components/ecosystem/business/HrManagementClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';
import { requireEmployerRole } from '@/lib/ecosystem/require-employer-role';

export default async function HrManagementPage() {
  await requireEmployerRole();
  const session = await requireEcosystemSession();
  return <HrManagementClient userEmail={session.user.email} />;
}
