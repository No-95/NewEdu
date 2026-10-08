import { CareerProfileClient } from '@/components/ecosystem/career/CareerProfileClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';
import { requireJobSeekerRole } from '@/lib/ecosystem/require-job-seeker-role';
import type { Metadata } from 'next';

export default async function CareerProfilePage() {
  await requireJobSeekerRole();
  const session = await requireEcosystemSession();
  return <CareerProfileClient userEmail={session.user.email} />;
}

export const metadata: Metadata = {
  title: "Hồ sơ nghề nghiệp",
  description: "Quản lý hồ sơ nghề nghiệp của bạn trên HDP EDU: kỹ năng, kinh nghiệm, trình độ tiếng Hàn và nguyện vọng công việc.",
  alternates: { canonical: 'https://hdpedu.com/career/profile' },
  robots: { index: false, follow: false },
}
