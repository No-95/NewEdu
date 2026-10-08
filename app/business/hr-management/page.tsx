import { HrManagementClient } from '@/components/ecosystem/business/HrManagementClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';
import { requireEmployerRole } from '@/lib/ecosystem/require-employer-role';
import type { Metadata } from 'next';

export default async function HrManagementPage() {
  await requireEmployerRole();
  const session = await requireEcosystemSession();
  return <HrManagementClient userEmail={session.user.email} />;
}

export const metadata: Metadata = {
  title: "Quản lý nhân sự Hàn–Việt",
  description: "Giải pháp quản lý nhân sự cho doanh nghiệp có lao động Việt làm việc với quản lý Hàn Quốc: hồ sơ, ca làm, đánh giá và đào tạo tiếng Hàn.",
  alternates: { canonical: 'https://hdpedu.com/business/hr-management' },
  robots: { index: false, follow: false },
}
