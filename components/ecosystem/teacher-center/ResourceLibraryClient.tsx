'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemActionBar } from '@/components/ecosystem/shared/EcosystemActionBar';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { EcosystemPageLoader } from '@/components/ecosystem/shared/EcosystemPageLoader';
import { useLanguage } from '@/lib/context/LanguageContext';
import { openFilePicker } from '@/lib/utils/client-actions';
import { notifyError, notifySuccess } from '@/lib/ui/notify';
import { Button } from '@/components/ui/button';

export function ResourceLibraryClient({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const resources = useQuery(api.teacherOps.listTeacherResources, { email: userEmail });
  const generateUploadUrl = useMutation(api.teacherOps.generateResourceUploadUrl);
  const createResource = useMutation(api.teacherOps.createTeacherResource);
  const deleteResource = useMutation(api.teacherOps.deleteTeacherResource);
  const [uploading, setUploading] = useState(false);

  const handleUpload = () => {
    openFilePicker({
      accept: '.pdf,.doc,.docx,.ppt,.pptx,.xlsx,.txt,.png,.jpg',
      onSelect: async (file) => {
        setUploading(true);
        try {
          const uploadUrl = await generateUploadUrl({});
          const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: { 'Content-Type': file.type || 'application/octet-stream' },
            body: file,
          });
          const { storageId } = (await response.json()) as { storageId: Id<'_storage'> };
          await createResource({
            email: userEmail,
            title: file.name.replace(/\.[^.]+$/, ''),
            fileName: file.name,
            mimeType: file.type || undefined,
            storageId,
          });
          notifySuccess(t('ecosystemPages.resourceLibrary.uploadSuccess'));
        } catch {
          notifyError(t('ecosystemPages.resourceLibrary.uploadFailed'));
        } finally {
          setUploading(false);
        }
      },
    });
  };

  if (resources === undefined) {
    return (
      <EcosystemPageLoader
        title={t('ecosystemPages.resourceLibrary.title')}
        subtitle={t('ecosystemPages.resourceLibrary.subtitle')}
      />
    );
  }

  return (
    <AppPageShell
      title={t('ecosystemPages.resourceLibrary.title')}
      subtitle={t('ecosystemPages.resourceLibrary.subtitle')}
      actions={
        <EcosystemActionBar
          actions={[
            {
              label: uploading
                ? t('ecosystemPages.resourceLibrary.actions.uploading')
                : t('ecosystemPages.resourceLibrary.actions.upload'),
              variant: 'default',
              onClick: handleUpload,
            },
          ]}
        />
      }
    >
      <EcosystemSection title={t('ecosystemPages.resourceLibrary.materialsSection')}>
        {resources.length === 0 ? (
          <div className="home-card-muted py-12 text-center">
            <p className="text-sm text-muted-foreground">{t('ecosystemPages.resourceLibrary.emptyMaterials')}</p>
            <p className="mt-2 text-xs text-muted-foreground">{t('ecosystemPages.resourceLibrary.emptyHint')}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {resources.map((resource) => (
              <li
                key={resource.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-foreground">{resource.title}</p>
                  <p className="text-xs text-muted-foreground">{resource.fileName}</p>
                </div>
                <div className="flex items-center gap-2">
                  {resource.url ? (
                    <Button asChild size="sm" variant="outline">
                      <a href={resource.url} target="_blank" rel="noreferrer">
                        {t('teacherOps.download')}
                      </a>
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      void deleteResource({
                        email: userEmail,
                        resourceId: resource.id as Id<'teacherResources'>,
                      })
                    }
                  >
                    {t('ecosystemPages.resourceLibrary.actions.delete')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </EcosystemSection>
    </AppPageShell>
  );
}
