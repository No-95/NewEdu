import { SettingsClient } from '@/components/settings/SettingsClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';
import type { Metadata } from 'next';

export default async function SettingsPage() {
  const session = await requireEcosystemSession();
  return <SettingsClient userEmail={session.user.email} />;
}

export const metadata: Metadata = {
  title: "Cài đặt tài khoản",
  description: "Cài đặt tài khoản HDP EDU: thông tin cá nhân, bảo mật, thông báo và tuỳ chọn học tập.",
  alternates: { canonical: 'https://hdpedu.com/settings' },
  robots: { index: false, follow: false },
}
