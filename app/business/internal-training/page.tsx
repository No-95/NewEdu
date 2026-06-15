import { InternalTrainingClient } from '@/components/ecosystem/business/InternalTrainingClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';

export default async function InternalTrainingPage() {
  const session = await requireEcosystemSession();
  return <InternalTrainingClient userEmail={session.user.email} />;
}
