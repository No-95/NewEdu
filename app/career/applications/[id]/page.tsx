import { ApplicationDetailClient } from '@/components/ecosystem/career/ApplicationDetailClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';
import { requireJobSeekerRole } from '@/lib/ecosystem/require-job-seeker-role';

export default async function CareerApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireJobSeekerRole();
  const session = await requireEcosystemSession();
  const { id } = await params;
  return <ApplicationDetailClient userEmail={session.user.email} applicationId={id} />;
}
