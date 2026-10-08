import { cookies } from 'next/headers';
import { CommunityForumClient } from '@/components/community/CommunityForumClient';
import type { Metadata } from 'next';

export default async function CommunityPage() {
  const cookieStore = await cookies();
  const userEmail = cookieStore.get('user_email')?.value ?? null;

  return <CommunityForumClient userEmail={userEmail} />;
}

export const metadata: Metadata = {
  title: "Cộng đồng học tiếng Hàn sản xuất",
  description: "Cộng đồng HDP EDU: hỏi đáp, chia sẻ kinh nghiệm học tiếng Hàn sản xuất và kinh nghiệm làm việc tại nhà máy, công xưởng Hàn Quốc.",
  alternates: { canonical: 'https://hdpedu.com/community' },
  robots: { index: true, follow: true },
}
