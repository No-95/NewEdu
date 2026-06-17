import { ConsultationsClient } from '@/components/ecosystem/career/ConsultationsClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';
import { requireJobSeekerRole } from '@/lib/ecosystem/require-job-seeker-role';

export default async function CareerConsultationsPage() {
  await requireJobSeekerRole();
  const session = await requireEcosystemSession();
  return <ConsultationsClient userEmail={session.user.email} />;
}
