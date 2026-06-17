import { ExpertProfileEditorClient } from '@/components/ecosystem/experts/ExpertProfileEditorClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';
import { requireExpertRole } from '@/lib/ecosystem/require-expert-role';

export default async function ExpertProfileEditPage() {
  await requireExpertRole();
  const session = await requireEcosystemSession();
  return <ExpertProfileEditorClient userEmail={session.user.email} />;
}
