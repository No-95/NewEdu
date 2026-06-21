import { RecruitmentClient } from '@/components/ecosystem/business/RecruitmentClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';

export default async function RecruitmentPage() {
  const session = await requireEcosystemSession();
  return <RecruitmentClient userEmail={session.user.email} />;
}
