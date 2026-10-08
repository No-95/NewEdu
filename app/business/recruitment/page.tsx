import { RecruitmentClient } from '@/components/ecosystem/business/RecruitmentClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';
import type { Metadata } from 'next';

export default async function RecruitmentPage() {
  const session = await requireEcosystemSession();
  return <RecruitmentClient userEmail={session.user.email} />;
}

export const metadata: Metadata = {
  title: "Tuyển dụng lao động biết tiếng Hàn",
  description: "Tuyển dụng nhân sự biết tiếng Hàn cho nhà máy và doanh nghiệp Hàn Quốc: đăng tin, lọc hồ sơ, kết nối ứng viên đã kiểm tra trình độ.",
  alternates: { canonical: 'https://hdpedu.com/business/recruitment' },
  robots: { index: false, follow: false },
}
