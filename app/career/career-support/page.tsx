import { CareerSupportClient } from '@/components/ecosystem/career/CareerSupportClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';
import { requireJobSeekerRole } from '@/lib/ecosystem/require-job-seeker-role';

export default async function CareerSupportPage() {
  await requireJobSeekerRole();
  const session = await requireEcosystemSession();
  return (
    <CareerSupportClient
      userEmail={session.user.email}
      defaultFullName={session.user.fullName}
      defaultPhone={session.user.phone}
    />
  );
}
