import type { Metadata } from 'next';

import { CandidateDetailClient } from '@/components/ecosystem/business/CandidateDetailClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';
import { requireEmployerRole } from '@/lib/ecosystem/require-employer-role';
import { buildMetadata } from '@/lib/seo';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return buildMetadata({
    title: 'Hồ sơ ứng viên',
    description:
      'Hồ sơ ứng viên trên HDP EDU: kỹ năng, kinh nghiệm và trình độ tiếng Hàn của người lao động Việt ứng tuyển vào doanh nghiệp Hàn Quốc.',
    path: `/business/recruitment/candidates/${id}`,
    index: false,
  });
}

export default async function CandidateDetailPage({ params }: PageProps) {
  await requireEmployerRole();
  const session = await requireEcosystemSession();
  const { id } = await params;
  return <CandidateDetailClient userEmail={session.user.email} candidateId={id} />;
}
