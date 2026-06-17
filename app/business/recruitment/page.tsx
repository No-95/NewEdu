import { RecruitmentClient } from '@/components/ecosystem/business/RecruitmentClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';
import { requireEmployerRole } from '@/lib/ecosystem/require-employer-role';

export default async function RecruitmentPage() {
  await requireEmployerRole();
  const session = await requireEcosystemSession();
  return <RecruitmentClient userEmail={session.user.email} />;
}
