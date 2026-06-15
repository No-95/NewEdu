import { AdmissionCrmClient } from '@/components/ecosystem/teacher-center/AdmissionCrmClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';

export default async function AdmissionCrmPage() {
  const session = await requireEcosystemSession();
  return <AdmissionCrmClient userEmail={session.user.email} />;
}
