import { ApplicationsClient } from '@/components/ecosystem/career/ApplicationsClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';
import { requireJobSeekerRole } from '@/lib/ecosystem/require-job-seeker-role';

export default async function CareerApplicationsPage() {
  await requireJobSeekerRole();
  const session = await requireEcosystemSession();
  return <ApplicationsClient userEmail={session.user.email} />;
}
