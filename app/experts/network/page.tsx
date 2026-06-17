import { ExpertNetworkClient } from '@/components/ecosystem/experts/ExpertNetworkClient';
import { getAuthenticatedSession } from '@/lib/auth';

export default async function ExpertNetworkPage() {
  const session = await getAuthenticatedSession();
  return <ExpertNetworkClient userEmail={session?.user.email} />;
}
