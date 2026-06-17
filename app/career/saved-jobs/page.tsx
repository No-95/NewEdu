import { SavedJobsClient } from '@/components/ecosystem/career/SavedJobsClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';
import { requireJobSeekerRole } from '@/lib/ecosystem/require-job-seeker-role';

export default async function SavedJobsPage() {
  await requireJobSeekerRole();
  const session = await requireEcosystemSession();
  return <SavedJobsClient userEmail={session.user.email} />;
}
