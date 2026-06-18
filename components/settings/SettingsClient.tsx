'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { EcosystemPageLoader } from '@/components/ecosystem/shared/EcosystemPageLoader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/lib/context/LanguageContext';

export function SettingsClient({ userEmail }: { userEmail: string }) {
  const { t, language } = useLanguage();
  const settings = useQuery(api.users.getUserSettings, { email: userEmail });
  const updateProfile = useMutation(api.users.updateUserProfile);
  const updateNotificationPrefs = useMutation(api.users.updateNotificationPreferences);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setFullName(settings.fullName ?? '');
    setPhone(settings.phone ?? '');
    setEmailNotifications(settings.emailNotificationsEnabled);
  }, [settings]);

  if (settings === undefined) {
    return (
      <EcosystemPageLoader
        title={t('settingsPage.title')}
        subtitle={t('settingsPage.subtitle')}
      />
    );
  }

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({
        email: userEmail,
        fullName: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotificationPrefs = async () => {
    setPrefsSaving(true);
    setPrefsSaved(false);
    try {
      await updateNotificationPrefs({
        email: userEmail,
        emailNotificationsEnabled: emailNotifications,
        preferredLocale: language,
      });
      setPrefsSaved(true);
    } finally {
      setPrefsSaving(false);
    }
  };

  return (
    <AppPageShell
      title={t('settingsPage.title')}
      subtitle={t('settingsPage.subtitle')}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <EcosystemSection title={t('settingsPage.profileSection')}>
          <div className="home-card space-y-4">
            <div>
              <Label htmlFor="settings-full-name">{t('settingsPage.fullName')}</Label>
              <Input
                id="settings-full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="settings-email">{t('settingsPage.email')}</Label>
              <Input id="settings-email" value={settings.email} disabled className="mt-1" />
            </div>
            <div>
              <Label htmlFor="settings-phone">{t('settingsPage.phone')}</Label>
              <Input
                id="settings-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? t('settingsPage.saving') : t('settingsPage.saveProfile')}
              </Button>
              {saved && <span className="text-sm text-emerald-400">{t('settingsPage.saved')}</span>}
            </div>
          </div>
        </EcosystemSection>

        <EcosystemSection title={t('settingsPage.accountSection')}>
          <div className="home-card space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('settingsPage.hdpId')}</p>
              <p className="mt-1 font-mono text-lg font-semibold text-primary">
                {settings.hdpId || '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('settingsPage.activeRole')}</p>
              <p className="mt-1 capitalize">{settings.activeRole || '—'}</p>
            </div>
            <div>
              <p className="mb-2 text-sm text-muted-foreground">{t('settingsPage.ecosystemRoles')}</p>
              {settings.roles.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('settingsPage.noRoles')}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {settings.roles.map((role: string) => (
                    <Badge
                      key={role}
                      className={
                        role === settings.activeRole
                          ? 'bg-primary/20 text-primary'
                          : 'bg-white/10'
                      }
                    >
                      {role.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </EcosystemSection>
      </div>

      <EcosystemSection title={t('settingsPage.notificationSection')}>
        <div className="home-card space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('settingsPage.notificationHint')}
          </p>
          <label className="flex items-center justify-between gap-4 text-sm">
            <span>{t('settingsPage.emailNotifications')}</span>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => {
                setEmailNotifications(e.target.checked);
                setPrefsSaved(false);
              }}
              className="h-4 w-4"
            />
          </label>
          <label className="flex items-center justify-between gap-4 text-sm opacity-60">
            <span>{t('settingsPage.pushNotifications')}</span>
            <input
              type="checkbox"
              checked={pushNotifications}
              disabled
              onChange={(e) => setPushNotifications(e.target.checked)}
              className="h-4 w-4"
            />
          </label>
          <p className="text-xs text-muted-foreground">{t('settingsPage.pushComingSoon')}</p>
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={() => void handleSaveNotificationPrefs()} disabled={prefsSaving}>
              {prefsSaving ? t('settingsPage.saving') : t('settingsPage.saveNotificationPrefs')}
            </Button>
            {prefsSaved ? <span className="text-sm text-emerald-400">{t('settingsPage.prefsSaved')}</span> : null}
          </div>
        </div>
      </EcosystemSection>

      <EcosystemSection title={t('settingsPage.profileLinksSection')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/career/profile"
            className="home-card-muted block transition-colors hover:border-primary/40"
          >
            <p className="font-semibold">{t('settingsPage.careerProfileLink')}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('settingsPage.careerProfileDesc')}
            </p>
          </Link>
          <Link
            href="/experts/profile"
            className="home-card-muted block transition-colors hover:border-primary/40"
          >
            <p className="font-semibold">{t('settingsPage.expertProfileLink')}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('settingsPage.expertProfileDesc')}
            </p>
          </Link>
        </div>
      </EcosystemSection>
    </AppPageShell>
  );
}
