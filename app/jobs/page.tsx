import { cookies } from 'next/headers';
import { CareerJobsClient } from '@/components/ecosystem/career/CareerJobsClient';
import type { Metadata } from 'next';

export default async function JobsPage() {
  const cookieStore = await cookies();
  const userEmail = cookieStore.get('user_email')?.value ?? null;

  return <CareerJobsClient userEmail={userEmail} />;
}

export const metadata: Metadata = {
  title: "Việc làm tiếng Hàn cho người Việt",
  description: "Tìm việc làm tiếng Hàn cho người Việt: nhà máy, công xưởng, văn phòng tại doanh nghiệp Hàn Quốc. Lọc theo lương, địa điểm, trình độ.",
  alternates: { canonical: 'https://hdpedu.com/jobs' },
  robots: { index: true, follow: true },
}
