import { CareerSupportClient } from '@/components/ecosystem/career/CareerSupportClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';
import { requireJobSeekerRole } from '@/lib/ecosystem/require-job-seeker-role';
import type { Metadata } from 'next';

export default async function CareerSupportPage() {
  await requireJobSeekerRole();
  const session = await requireEcosystemSession();
  return (
    <CareerSupportClient
      userEmail={session.user.email}
      defaultFullName={session.user.fullName}
      defaultPhone={session.user.phone}
    />
  );
}

export const metadata: Metadata = {
  title: "Hỗ trợ nghề nghiệp",
  description: "Dịch vụ hỗ trợ nghề nghiệp của HDP EDU: sửa CV, luyện phỏng vấn tiếng Hàn và định hướng nghề nghiệp cho người lao động Việt.",
  alternates: { canonical: 'https://hdpedu.com/career/career-support' },
  robots: { index: false, follow: false },
}
