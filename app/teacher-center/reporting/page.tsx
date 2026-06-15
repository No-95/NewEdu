import { ReportingClient } from '@/components/ecosystem/teacher-center/ReportingClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';

export default async function ReportingPage() {
  const session = await requireEcosystemSession();
  return <ReportingClient userEmail={session.user.email} />;
}
