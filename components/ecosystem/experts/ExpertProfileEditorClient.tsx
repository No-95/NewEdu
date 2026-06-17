'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemActionBar } from '@/components/ecosystem/shared/EcosystemActionBar';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ExpertNetworkCard } from '@/components/ecosystem/experts/ExpertNetworkCard';

export function ExpertProfileEditorClient({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const profile = useQuery(api.experts.getExpertProfileForEdit, { email: userEmail });
  const upsertProfile = useMutation(api.experts.upsertExpertProfile);
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [industriesText, setIndustriesText] = useState('');
  const [expertiseText, setExpertiseText] = useState('');
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadForm = () => {
    setDisplayName(profile?.displayName ?? '');
    setHeadline(profile?.headline ?? '');
    setBio(profile?.bio ?? '');
    setIndustriesText((profile?.industries ?? []).join(', '));
    setExpertiseText((profile?.expertise ?? []).join(', '));
    setPublished(profile?.published ?? false);
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertProfile({
        email: userEmail,
        displayName,
        headline,
        bio: bio || undefined,
        industries: industriesText.split(',').map((s) => s.trim()).filter(Boolean),
        expertise: expertiseText.split(',').map((s) => s.trim()).filter(Boolean),
        published,
      });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const previewExpertise = open
    ? expertiseText.split(',').map((s) => s.trim()).filter(Boolean)
    : (profile?.expertise ?? []);

  return (
    <AppPageShell
      title={t('ecosystemPages.expertProfile.title')}
      subtitle={t('ecosystemPages.expertProfile.subtitle')}
      actions={
        <EcosystemActionBar
          actions={[
            { label: t('ecosystemPages.expertProfile.edit'), variant: 'default', onClick: loadForm },
          ]}
        />
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          {profile === undefined ? (
            <p className="text-sm text-muted-foreground">{t('ecosystemPages.shared.loading')}</p>
          ) : !profile ? (
            <EcosystemSection title={t('ecosystemPages.expertProfile.emptyTitle')}>
              <p className="text-sm text-muted-foreground">{t('ecosystemPages.expertProfile.emptyBody')}</p>
              <Button className="mt-4" onClick={loadForm}>
                {t('ecosystemPages.expertProfile.create')}
              </Button>
            </EcosystemSection>
          ) : (
            <ExpertNetworkCard
              displayName={profile.displayName}
              headline={profile.headline}
              bio={profile.bio}
              expertise={profile.expertise}
              published={profile.published}
            />
          )}
        </div>

        <EcosystemSection title={t('ecosystemPages.expertProfile.previewTitle')}>
          <ExpertNetworkCard
            displayName={open ? displayName : profile?.displayName ?? ''}
            headline={open ? headline : profile?.headline ?? ''}
            bio={open ? bio : profile?.bio}
            expertise={previewExpertise}
            published={open ? published : profile?.published}
          />
        </EcosystemSection>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t('ecosystemPages.expertProfile.edit')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <div>
                <Label>{t('ecosystemPages.expertProfile.displayName')}</Label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <div>
                <Label>{t('ecosystemPages.expertProfile.headline')}</Label>
                <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
              </div>
              <div>
                <Label>{t('ecosystemPages.expertProfile.bio')}</Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
              </div>
              <div>
                <Label>{t('ecosystemPages.expertProfile.industries')}</Label>
                <Input value={industriesText} onChange={(e) => setIndustriesText(e.target.value)} placeholder="Education, HR" />
              </div>
              <div>
                <Label>{t('ecosystemPages.expertProfile.expertise')}</Label>
                <Input value={expertiseText} onChange={(e) => setExpertiseText(e.target.value)} placeholder="Career coaching, TOPIK" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                {t('ecosystemPages.expertProfile.publishToNetwork')}
              </label>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('ecosystemPages.expertProfile.previewTitle')}
              </p>
              <ExpertNetworkCard
                displayName={displayName}
                headline={headline}
                bio={bio}
                expertise={expertiseText.split(',').map((s) => s.trim()).filter(Boolean)}
                published={published}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving || !displayName || !headline}>
              {t('employerOps.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppPageShell>
  );
}
