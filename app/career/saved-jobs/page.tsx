import { SavedJobsClient } from '@/components/ecosystem/career/SavedJobsClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';
import { requireJobSeekerRole } from '@/lib/ecosystem/require-job-seeker-role';
import type { Metadata } from 'next';

export default async function SavedJobsPage() {
  await requireJobSeekerRole();
  const session = await requireEcosystemSession();
  return <SavedJobsClient userEmail={session.user.email} />;
}

export const metadata: Metadata = {
  title: "Việc làm đã lưu",
  description: "Danh sách việc làm bạn đã lưu trên HDP EDU. Ứng tuyển nhanh, theo dõi hạn nộp và so sánh các vị trí tiếng Hàn phù hợp.",
  alternates: { canonical: 'https://hdpedu.com/career/saved-jobs' },
  robots: { index: false, follow: false },
}
