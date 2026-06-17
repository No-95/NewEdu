import { SettingsClient } from '@/components/settings/SettingsClient';
import { requireEcosystemSession } from '@/lib/ecosystem/require-session';

export default async function SettingsPage() {
  const session = await requireEcosystemSession();
  return <SettingsClient userEmail={session.user.email} />;
}
