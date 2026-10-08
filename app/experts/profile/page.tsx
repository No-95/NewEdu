import { ExpertProfileEditorClient } from '@/components/ecosystem/experts/ExpertProfileEditorClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';
import { requireExpertRole } from '@/lib/ecosystem/require-expert-role';
import type { Metadata } from 'next';

export default async function ExpertProfileEditPage() {
  await requireExpertRole();
  const session = await requireEcosystemSession();
  return <ExpertProfileEditorClient userEmail={session.user.email} />;
}

export const metadata: Metadata = {
  title: "Hồ sơ chuyên gia",
  description: "Chỉnh sửa hồ sơ chuyên gia của bạn trên HDP EDU: chuyên môn, ngành nghề, giới thiệu và trạng thái hiển thị.",
  alternates: { canonical: 'https://hdpedu.com/experts/profile' },
  robots: { index: false, follow: false },
}
