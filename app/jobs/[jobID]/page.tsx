import { JobDetailClient } from '@/components/ecosystem/career/JobDetailClient';
import { getAuthenticatedSession } from '@/lib/auth';

type JobPageProps = {
  params: Promise<{ jobID: string }>;
};

export default async function JobDetailPage({ params }: JobPageProps) {
  const { jobID } = await params;
  const session = await getAuthenticatedSession();

  return <JobDetailClient jobId={jobID} userEmail={session?.user.email} />;
}
