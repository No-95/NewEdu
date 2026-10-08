import { ExpertNetworkClient } from '@/components/ecosystem/experts/ExpertNetworkClient';
import { getAuthenticatedSession } from '@/lib/auth';
import type { Metadata } from 'next';

export default async function ExpertNetworkPage() {
  const session = await getAuthenticatedSession();
  return <ExpertNetworkClient userEmail={session?.user.email} />;
}

export const metadata: Metadata = {
  title: "Mạng lưới chuyên gia HDP EDU",
  description: "Kết nối với chuyên gia HDP EDU về tiếng Hàn sản xuất, tuyển dụng, nhân sự và đào tạo cho doanh nghiệp Hàn–Việt.",
  alternates: { canonical: 'https://hdpedu.com/experts/network' },
  robots: { index: true, follow: true },
}
