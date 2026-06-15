import { CareerProfileClient } from '@/components/ecosystem/career/CareerProfileClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';

export default async function CareerProfilePage() {
  const session = await requireEcosystemSession();
  return <CareerProfileClient userEmail={session.user.email} />;
}
