import { HrManagementClient } from '@/components/ecosystem/business/HrManagementClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';

export default async function HrManagementPage() {
  const session = await requireEcosystemSession();
  return <HrManagementClient userEmail={session.user.email} />;
}
