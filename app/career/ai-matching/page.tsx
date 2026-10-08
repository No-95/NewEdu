import { AiMatchingClient } from '@/components/ecosystem/career/AiMatchingClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';
import { requireJobSeekerRole } from '@/lib/ecosystem/require-job-seeker-role';
import type { Metadata } from 'next';

export default async function AiMatchingPage() {
  await requireJobSeekerRole();
  const session = await requireEcosystemSession();
  return <AiMatchingClient userEmail={session.user.email} />;
}

export const metadata: Metadata = {
  title: "Ghép việc làm bằng AI",
  description: "Công cụ ghép việc làm bằng AI của HDP EDU: phân tích kỹ năng, trình độ tiếng Hàn và nguyện vọng để gợi ý vị trí phù hợp nhất.",
  alternates: { canonical: 'https://hdpedu.com/career/ai-matching' },
  robots: { index: false, follow: false },
}
