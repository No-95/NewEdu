'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemDataTable } from '@/components/ecosystem/shared/EcosystemDataTable';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { EcosystemPageLoader } from '@/components/ecosystem/shared/EcosystemPageLoader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/context/LanguageContext';

type ApplicationRow = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  specialization: string;
  status: string;
  createdAt: number;
};

function statusBadgeClass(status: string) {
  switch (status) {
    case 'accepted':
      return 'bg-emerald-500/20 text-emerald-300';
    case 'rejected':
      return 'bg-red-500/20 text-red-300';
    case 'in_review':
      return 'bg-amber-500/20 text-amber-300';
    default:
      return 'bg-white/10 text-muted-foreground';
  }
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ');
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function AdminApplicationsClient({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState('teacher');
  const [busyId, setBusyId] = useState<string | null>(null);

  const teacherApplications = useQuery(api.teacherApplications.listTeacherApplicationsForReview, {
    adminEmail: userEmail,
  });
  const expertApplications = useQuery(api.experts.listExpertApplicationsForReview, {
    adminEmail: userEmail,
  });

  const acceptTeacher = useMutation(api.teacherApplications.acceptTeacherApplication);
  const rejectTeacher = useMutation(api.teacherApplications.rejectTeacherApplication);
  const markTeacherInReview = useMutation(api.teacherApplications.markTeacherApplicationInReview);
  const acceptExpert = useMutation(api.experts.acceptExpertApplication);
  const rejectExpert = useMutation(api.experts.rejectExpertApplication);
  const markExpertInReview = useMutation(api.experts.markExpertApplicationInReview);

  const loading =
    tab === 'teacher' ? teacherApplications === undefined : expertApplications === undefined;

  if (loading) {
    return (
      <EcosystemPageLoader
        title={t('adminApplicationsPage.title')}
        subtitle={t('adminApplicationsPage.subtitle')}
      />
    );
  }

  const teacherRows: ApplicationRow[] = (teacherApplications ?? []).map((application: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    specialization: string;
    status: string;
    createdAt: number;
  }) => ({
    id: application._id,
    fullName: application.fullName,
    email: application.email,
    phone: application.phone,
    specialization: application.specialization,
    status: application.status,
    createdAt: application.createdAt,
  }));

  const expertRows: ApplicationRow[] = expertApplications ?? [];

  const runAction = async (id: string, action: () => Promise<unknown>) => {
    setBusyId(id);
    try {
      await action();
    } finally {
      setBusyId(null);
    }
  };

  const renderStatus = (row: ApplicationRow) => (
    <Badge className={statusBadgeClass(row.status)}>{formatStatus(row.status)}</Badge>
  );

  const renderTeacherActions = (row: ApplicationRow) => {
    const pending = busyId === row.id;
    const closed = row.status === 'accepted' || row.status === 'rejected';

    return (
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={pending || closed}
          onClick={() =>
            runAction(row.id, () =>
              acceptTeacher({
                adminEmail: userEmail,
                applicationId: row.id as Id<'teacherApplications'>,
              })
            )
          }
        >
          {t('adminApplicationsPage.accept')}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={pending || closed || row.status === 'in_review'}
          onClick={() =>
            runAction(row.id, () =>
              markTeacherInReview({
                adminEmail: userEmail,
                applicationId: row.id as Id<'teacherApplications'>,
              })
            )
          }
        >
          {t('adminApplicationsPage.inReview')}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={pending || closed}
          onClick={() =>
            runAction(row.id, () =>
              rejectTeacher({
                adminEmail: userEmail,
                applicationId: row.id as Id<'teacherApplications'>,
              })
            )
          }
        >
          {t('adminApplicationsPage.reject')}
        </Button>
      </div>
    );
  };

  const renderExpertActions = (row: ApplicationRow) => {
    const pending = busyId === row.id;
    const closed = row.status === 'accepted' || row.status === 'rejected';

    return (
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={pending || closed}
          onClick={() =>
            runAction(row.id, () =>
              acceptExpert({
                adminEmail: userEmail,
                applicationId: row.id as Id<'expertApplications'>,
              })
            )
          }
        >
          {t('adminApplicationsPage.accept')}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={pending || closed || row.status === 'in_review'}
          onClick={() =>
            runAction(row.id, () =>
              markExpertInReview({
                adminEmail: userEmail,
                applicationId: row.id as Id<'expertApplications'>,
              })
            )
          }
        >
          {t('adminApplicationsPage.inReview')}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={pending || closed}
          onClick={() =>
            runAction(row.id, () =>
              rejectExpert({
                adminEmail: userEmail,
                applicationId: row.id as Id<'expertApplications'>,
              })
            )
          }
        >
          {t('adminApplicationsPage.reject')}
        </Button>
      </div>
    );
  };

  const baseColumns = [
    { key: 'fullName', header: t('adminApplicationsPage.name') },
    { key: 'email', header: t('adminApplicationsPage.email') },
    { key: 'specialization', header: t('adminApplicationsPage.specialization') },
    {
      key: 'createdAt',
      header: t('adminApplicationsPage.submitted'),
      render: (row: ApplicationRow) => formatDate(row.createdAt),
    },
    {
      key: 'status',
      header: t('adminApplicationsPage.status'),
      render: renderStatus,
    },
  ];

  return (
    <AppPageShell
      title={t('adminApplicationsPage.title')}
      subtitle={t('adminApplicationsPage.subtitle')}
    >
      <EcosystemSection title={t('adminApplicationsPage.pendingSection')}>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4 bg-white/5">
            <TabsTrigger value="teacher">
              {t('adminApplicationsPage.teacherTab')} ({teacherRows.length})
            </TabsTrigger>
            <TabsTrigger value="expert">
              {t('adminApplicationsPage.expertTab')} ({expertRows.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teacher">
            <EcosystemDataTable
              rows={teacherRows}
              emptyMessage={t('adminApplicationsPage.emptyTeacher')}
              columns={[
                ...baseColumns,
                { key: 'phone', header: t('adminApplicationsPage.phone') },
                {
                  key: 'actions',
                  header: t('adminApplicationsPage.actions'),
                  render: renderTeacherActions,
                },
              ]}
            />
          </TabsContent>

          <TabsContent value="expert">
            <EcosystemDataTable
              rows={expertRows}
              emptyMessage={t('adminApplicationsPage.emptyExpert')}
              columns={[
                ...baseColumns,
                {
                  key: 'actions',
                  header: t('adminApplicationsPage.actions'),
                  render: renderExpertActions,
                },
              ]}
            />
          </TabsContent>
        </Tabs>
      </EcosystemSection>
    </AppPageShell>
  );
}
