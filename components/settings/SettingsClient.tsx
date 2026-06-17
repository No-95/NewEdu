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
  const { language } = useLanguage();
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
        title="Account settings"
        subtitle="Manage your profile and ecosystem roles"
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
      title="Account settings"
      subtitle="Manage your profile and ecosystem roles"
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <EcosystemSection title="Profile">
          <div className="home-card space-y-4">
            <div>
              <Label htmlFor="settings-full-name">Full name</Label>
              <Input
                id="settings-full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="settings-email">Email</Label>
              <Input id="settings-email" value={settings.email} disabled className="mt-1" />
            </div>
            <div>
              <Label htmlFor="settings-phone">Phone</Label>
              <Input
                id="settings-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save profile'}
              </Button>
              {saved && <span className="text-sm text-emerald-400">Saved successfully.</span>}
            </div>
          </div>
        </EcosystemSection>

        <EcosystemSection title="Account">
          <div className="home-card space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">HDP ID</p>
              <p className="mt-1 font-mono text-lg font-semibold text-primary">
                {settings.hdpId || '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active role</p>
              <p className="mt-1 capitalize">{settings.activeRole || '—'}</p>
            </div>
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Ecosystem roles</p>
              {settings.roles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No roles assigned yet.</p>
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

      <EcosystemSection title="Notification preferences">
        <div className="home-card space-y-4">
          <p className="text-sm text-muted-foreground">
            Email alerts mirror in-app notifications. Language follows your site preference when saved.
          </p>
          <label className="flex items-center justify-between gap-4 text-sm">
            <span>Email notifications</span>
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
            <span>Push notifications</span>
            <input
              type="checkbox"
              checked={pushNotifications}
              disabled
              onChange={(e) => setPushNotifications(e.target.checked)}
              className="h-4 w-4"
            />
          </label>
          <p className="text-xs text-muted-foreground">Push notifications coming in a future update.</p>
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={() => void handleSaveNotificationPrefs()} disabled={prefsSaving}>
              {prefsSaving ? 'Saving…' : 'Save notification preferences'}
            </Button>
            {prefsSaved ? <span className="text-sm text-emerald-400">Preferences saved.</span> : null}
          </div>
        </div>
      </EcosystemSection>

      <EcosystemSection title="Profile links">
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/career/profile"
            className="home-card-muted block transition-colors hover:border-primary/40"
          >
            <p className="font-semibold">Career profile</p>
            <p className="mt-1 text-sm text-muted-foreground">
              View and edit your competency profile for job seekers.
            </p>
          </Link>
          <Link
            href="/experts/profile"
            className="home-card-muted block transition-colors hover:border-primary/40"
          >
            <p className="font-semibold">Expert profile</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your expert profile and consultation settings.
            </p>
          </Link>
        </div>
      </EcosystemSection>
    </AppPageShell>
  );
}
