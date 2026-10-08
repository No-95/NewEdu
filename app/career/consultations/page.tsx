import { ConsultationsClient } from '@/components/ecosystem/career/ConsultationsClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';
import { requireJobSeekerRole } from '@/lib/ecosystem/require-job-seeker-role';
import type { Metadata } from 'next';

export default async function CareerConsultationsPage() {
  await requireJobSeekerRole();
  const session = await requireEcosystemSession();
  return <ConsultationsClient userEmail={session.user.email} />;
}

export const metadata: Metadata = {
  title: "Đặt lịch tư vấn nghề nghiệp",
  description: "Đặt lịch tư vấn 1-1 với chuyên gia HDP EDU về việc làm, lộ trình học tiếng Hàn và phát triển nghề nghiệp tại doanh nghiệp Hàn Quốc.",
  alternates: { canonical: 'https://hdpedu.com/career/consultations' },
  robots: { index: false, follow: false },
}
