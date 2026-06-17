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
        title="Application review"
        subtitle="Review teacher and expert applications"
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
          Accept
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
          In review
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
          Reject
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
          Accept
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
          In review
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
          Reject
        </Button>
      </div>
    );
  };

  const baseColumns = [
    { key: 'fullName', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'specialization', header: 'Specialization' },
    {
      key: 'createdAt',
      header: 'Submitted',
      render: (row: ApplicationRow) => formatDate(row.createdAt),
    },
    {
      key: 'status',
      header: 'Status',
      render: renderStatus,
    },
  ];

  return (
    <AppPageShell
      title="Application review"
      subtitle="Review teacher and expert applications"
    >
      <EcosystemSection title="Pending applications">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4 bg-white/5">
            <TabsTrigger value="teacher">Teacher ({teacherRows.length})</TabsTrigger>
            <TabsTrigger value="expert">Expert ({expertRows.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="teacher">
            <EcosystemDataTable
              rows={teacherRows}
              emptyMessage="No teacher applications to review."
              columns={[
                ...baseColumns,
                { key: 'phone', header: 'Phone' },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: renderTeacherActions,
                },
              ]}
            />
          </TabsContent>

          <TabsContent value="expert">
            <EcosystemDataTable
              rows={expertRows}
              emptyMessage="No expert applications to review."
              columns={[
                ...baseColumns,
                {
                  key: 'actions',
                  header: 'Actions',
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
