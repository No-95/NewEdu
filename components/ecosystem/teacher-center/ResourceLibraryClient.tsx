'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemFilterBar } from '@/components/ecosystem/shared/EcosystemFilterBar';
import { EcosystemDataTable } from '@/components/ecosystem/shared/EcosystemDataTable';
import { EcosystemActionBar } from '@/components/ecosystem/shared/EcosystemActionBar';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { MOCK_RESOURCES, RESOURCE_CATEGORIES } from '@/lib/ecosystem/mock-data';
import { useLanguage } from '@/lib/context/LanguageContext';
import { buildContactHref, downloadTextFile, openFilePicker } from '@/lib/utils/client-actions';
import { Badge } from '@/components/ui/badge';
import { Download, FileText } from 'lucide-react';

export function ResourceLibraryClient() {
  const { t } = useLanguage();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return MOCK_RESOURCES.filter((r) => {
      const matchSearch =
        !search ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.uploadedBy.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'all' || r.category === category;
      return matchSearch && matchCategory;
    });
  }, [search, category]);

  const selectedResource = filtered.find((item) => item.id === selectedResourceId) ?? filtered[0] ?? null;

  const downloadResource = (resource: (typeof MOCK_RESOURCES)[number]) => {
    const content = [
      `HDP EDU Resource Request`,
      `Title: ${resource.title}`,
      `Category: ${resource.category}`,
      `Format: ${resource.format}`,
      `Uploaded by: ${resource.uploadedBy}`,
      `Updated: ${resource.updatedAt}`,
      '',
      'This is a catalog reference export. Contact HDP EDU for the full file.',
    ].join('\n');
    downloadTextFile(`${resource.title.replace(/\s+/g, '-').toLowerCase()}-info.txt`, content);
  };

  return (
    <AppPageShell
      title={t('ecosystemPages.resourceLibrary.title')}
      subtitle={t('ecosystemPages.resourceLibrary.subtitle')}
      actions={
        <EcosystemActionBar
          actions={[
            {
              label: t('ecosystemPages.resourceLibrary.actions.upload'),
              variant: 'default',
              onClick: () =>
                openFilePicker({
                  accept: '.pdf,.doc,.docx,.ppt,.pptx,.xlsx',
                  onSelect: (file) => {
                    router.push(
                      buildContactHref({
                        topic: 'resource-upload',
                        role: 'teacher',
                        message: `Upload request for resource file: ${file.name}`,
                      })
                    );
                  },
                }),
            },
            {
              label: t('ecosystemPages.resourceLibrary.actions.edit'),
              variant: 'outline',
              href: buildContactHref({
                topic: 'resource-edit',
                role: 'teacher',
                message: selectedResource ? `Edit resource: ${selectedResource.title}` : 'Edit resource request',
              }),
            },
            {
              label: t('ecosystemPages.resourceLibrary.actions.delete'),
              variant: 'outline',
              href: buildContactHref({
                topic: 'resource-delete',
                role: 'teacher',
                message: selectedResource ? `Delete resource: ${selectedResource.title}` : 'Delete resource request',
              }),
            },
          ]}
        />
      }
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {RESOURCE_CATEGORIES.map((cat) => (
          <Badge
            key={cat}
            variant="secondary"
            className={`cursor-pointer bg-white/10 hover:bg-primary/20 ${category === cat ? 'border-primary/40 bg-primary/20 text-primary' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>

      <EcosystemFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('ecosystemPages.resourceLibrary.searchPlaceholder')}
        filters={[
          {
            key: 'category',
            label: t('ecosystemPages.resourceLibrary.categoryFilter'),
            options: [
              { value: 'all', label: t('ecosystemPages.shared.all') },
              ...RESOURCE_CATEGORIES.map((c) => ({ value: c, label: c })),
            ],
          },
        ]}
        filterValues={{ category }}
        onFilterChange={(_, v) => setCategory(v)}
      />

      <EcosystemSection
        title={`${t('ecosystemPages.resourceLibrary.materialsSection')} (${filtered.length})`}
        className="mt-6"
      >
        <EcosystemDataTable
          rows={filtered}
          onRowClick={(row) => setSelectedResourceId(String(row.id))}
          columns={[
            {
              key: 'title',
              header: t('ecosystemPages.shared.table.title'),
              render: (row) => (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>{row.title}</span>
                </div>
              ),
            },
            { key: 'category', header: t('ecosystemPages.shared.table.category') },
            { key: 'format', header: t('ecosystemPages.shared.table.format') },
            { key: 'uploadedBy', header: t('ecosystemPages.shared.table.uploadedBy') },
            { key: 'downloads', header: t('ecosystemPages.shared.table.downloads') },
            { key: 'updatedAt', header: t('ecosystemPages.shared.table.updated') },
            {
              key: 'actions',
              header: '',
              render: (row) => (
                <button
                  type="button"
                  className="text-primary hover:text-primary/80"
                  onClick={(event) => {
                    event.stopPropagation();
                    downloadResource(row as (typeof MOCK_RESOURCES)[number]);
                  }}
                >
                  <Download className="h-4 w-4" />
                </button>
              ),
            },
          ]}
        />
      </EcosystemSection>
    </AppPageShell>
  );
}
