import { InternalTrainingClient } from '@/components/ecosystem/business/InternalTrainingClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';
import { requireEmployerRole } from '@/lib/ecosystem/require-employer-role';

export default async function InternalTrainingPage() {
  await requireEmployerRole();
  const session = await requireEcosystemSession();
  return <InternalTrainingClient userEmail={session.user.email} />;
}
