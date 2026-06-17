import { AiMatchingClient } from '@/components/ecosystem/career/AiMatchingClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';
import { requireJobSeekerRole } from '@/lib/ecosystem/require-job-seeker-role';

export default async function AiMatchingPage() {
  await requireJobSeekerRole();
  const session = await requireEcosystemSession();
  return <AiMatchingClient userEmail={session.user.email} />;
}
