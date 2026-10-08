import { InternalTrainingClient } from '@/components/ecosystem/business/InternalTrainingClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';
import { requireEmployerRole } from '@/lib/ecosystem/require-employer-role';
import type { Metadata } from 'next';

export default async function InternalTrainingPage() {
  await requireEmployerRole();
  const session = await requireEcosystemSession();
  return <InternalTrainingClient userEmail={session.user.email} />;
}

export const metadata: Metadata = {
  title: "Đào tạo nội bộ tiếng Hàn cho doanh nghiệp",
  description: "Chương trình đào tạo tiếng Hàn sản xuất cho nhân viên nhà máy, công xưởng. Lộ trình theo vị trí, đo lường tiến bộ, triển khai theo nhóm.",
  alternates: { canonical: 'https://hdpedu.com/business/internal-training' },
  robots: { index: false, follow: false },
}
