import { ApplicationsClient } from '@/components/ecosystem/career/ApplicationsClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';
import { requireJobSeekerRole } from '@/lib/ecosystem/require-job-seeker-role';
import type { Metadata } from 'next';

export default async function CareerApplicationsPage() {
  await requireJobSeekerRole();
  const session = await requireEcosystemSession();
  return <ApplicationsClient userEmail={session.user.email} />;
}

export const metadata: Metadata = {
  title: "Đơn ứng tuyển của tôi",
  description: "Theo dõi trạng thái các đơn ứng tuyển của bạn trên HDP EDU: đã gửi, đang xem xét, phỏng vấn và kết quả.",
  alternates: { canonical: 'https://hdpedu.com/career/applications' },
  robots: { index: false, follow: false },
}
