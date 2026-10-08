import type { Metadata } from 'next';

import { ApplicationDetailClient } from '@/components/ecosystem/career/ApplicationDetailClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';
import { requireJobSeekerRole } from '@/lib/ecosystem/require-job-seeker-role';
import { buildMetadata } from '@/lib/seo';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return buildMetadata({
    title: 'Chi tiết đơn ứng tuyển',
    description:
      'Theo dõi trạng thái đơn ứng tuyển của bạn trên HDP EDU: đã gửi, đang xem xét, phỏng vấn và kết quả.',
    path: `/career/applications/${id}`,
    index: false,
  });
}

export default async function CareerApplicationDetailPage({ params }: PageProps) {
  await requireJobSeekerRole();
  const session = await requireEcosystemSession();
  const { id } = await params;
  return <ApplicationDetailClient userEmail={session.user.email} applicationId={id} />;
}
