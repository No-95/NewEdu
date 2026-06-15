import { TrainingManagementClient } from '@/components/ecosystem/teacher-center/TrainingManagementClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';

export default async function TrainingManagementPage() {
  const session = await requireEcosystemSession();
  return <TrainingManagementClient userEmail={session.user.email} />;
}
