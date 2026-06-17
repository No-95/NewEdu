import { CareerProfileClient } from '@/components/ecosystem/career/CareerProfileClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';
import { requireJobSeekerRole } from '@/lib/ecosystem/require-job-seeker-role';

export default async function CareerProfilePage() {
  await requireJobSeekerRole();
  const session = await requireEcosystemSession();
  return <CareerProfileClient userEmail={session.user.email} />;
}
