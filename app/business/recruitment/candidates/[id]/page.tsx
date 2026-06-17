import { CandidateDetailClient } from '@/components/ecosystem/business/CandidateDetailClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';
import { requireEmployerRole } from '@/lib/ecosystem/require-employer-role';

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireEmployerRole();
  const session = await requireEcosystemSession();
  const { id } = await params;
  return <CandidateDetailClient userEmail={session.user.email} candidateId={id} />;
}
