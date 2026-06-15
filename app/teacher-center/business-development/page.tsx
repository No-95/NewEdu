import { BusinessDevelopmentClient } from '@/components/ecosystem/teacher-center/BusinessDevelopmentClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';

export default async function BusinessDevelopmentPage() {
  const session = await requireEcosystemSession();
  return <BusinessDevelopmentClient userEmail={session.user.email} />;
}
