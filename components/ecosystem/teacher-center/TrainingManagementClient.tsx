'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemMetricGrid } from '@/components/ecosystem/shared/EcosystemMetricGrid';
import { EcosystemModuleGrid } from '@/components/ecosystem/shared/EcosystemModuleGrid';
import { EcosystemDataTable } from '@/components/ecosystem/shared/EcosystemDataTable';
import { EcosystemActionBar } from '@/components/ecosystem/shared/EcosystemActionBar';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { EcosystemPageLoader } from '@/components/ecosystem/shared/EcosystemPageLoader';
import { buildTrainingModules } from '@/lib/ecosystem/constants';
import { useLanguage } from '@/lib/context/LanguageContext';
import { translateMetrics } from '@/lib/ecosystem/i18n';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function TrainingManagementClient({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState('students');
  const data = useQuery(api.ecosystem.getTrainingManagementDashboard, { email: userEmail });

  if (data === undefined) {
    return (
      <EcosystemPageLoader
        title={t('ecosystemPages.trainingManagement.title')}
        subtitle={t('ecosystemPages.trainingManagement.subtitle')}
      />
    );
  }

  const metrics = translateMetrics(data.metrics, t, 'ecosystemPages.trainingManagement.metrics');
  const trainingModules = buildTrainingModules(t);

  return (
    <AppPageShell
      title={t('ecosystemPages.trainingManagement.title')}
      subtitle={t('ecosystemPages.trainingManagement.subtitle')}
      actions={
        <EcosystemActionBar
          actions={[
            { label: t('ecosystemPages.trainingManagement.actions.createClass'), variant: 'default' },
            { label: t('ecosystemPages.trainingManagement.actions.assignTeacher'), variant: 'outline' },
            { label: t('ecosystemPages.trainingManagement.actions.addStudent'), variant: 'outline' },
            { label: t('ecosystemPages.trainingManagement.actions.exportReport'), variant: 'outline' },
          ]}
        />
      }
    >
      <EcosystemSection title={t('ecosystemPages.shared.overview')}>
        <EcosystemMetricGrid stats={metrics} />
      </EcosystemSection>

      <EcosystemSection title={t('ecosystemPages.trainingManagement.modulesSection')}>
        <EcosystemModuleGrid modules={trainingModules} />
      </EcosystemSection>

      <EcosystemSection title={t('ecosystemPages.trainingManagement.dataSection')}>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4 bg-white/5">
            <TabsTrigger value="students">{t('ecosystemPages.trainingManagement.tabs.students')}</TabsTrigger>
            <TabsTrigger value="teachers">{t('ecosystemPages.trainingManagement.tabs.teachers')}</TabsTrigger>
            <TabsTrigger value="classes">{t('ecosystemPages.trainingManagement.tabs.classes')}</TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <EcosystemDataTable
              rows={data.students}
              emptyMessage={t('ecosystemPages.trainingManagement.emptyStudents')}
              columns={[
                { key: 'name', header: t('ecosystemPages.shared.table.name') },
                { key: 'email', header: t('ecosystemPages.shared.table.email') },
                { key: 'className', header: t('ecosystemPages.shared.table.class') },
                {
                  key: 'status',
                  header: t('ecosystemPages.shared.table.status'),
                  render: (row) => (
                    <Badge variant="secondary" className="bg-white/10 capitalize">
                      {row.status}
                    </Badge>
                  ),
                },
                {
                  key: 'attendanceRate',
                  header: t('ecosystemPages.trainingManagement.attendance'),
                  render: (row) => (
                    <div className="flex items-center gap-2">
                      <Progress value={row.attendanceRate} className="h-2 w-20" />
                      <span className="text-xs tabular-nums">{row.attendanceRate}%</span>
                    </div>
                  ),
                },
              ]}
            />
          </TabsContent>

          <TabsContent value="teachers">
            <EcosystemDataTable
              rows={data.teachers}
              emptyMessage={t('ecosystemPages.trainingManagement.emptyTeachers')}
              columns={[
                { key: 'name', header: t('ecosystemPages.shared.table.teacher') },
                { key: 'subject', header: t('ecosystemPages.shared.table.subject') },
                { key: 'classes', header: t('ecosystemPages.shared.table.class') },
                { key: 'students', header: t('ecosystemPages.shared.table.students') },
                {
                  key: 'status',
                  header: t('ecosystemPages.shared.table.status'),
                  render: (row) => (
                    <Badge variant="secondary" className="bg-white/10">
                      {row.status === 'active'
                        ? t('ecosystemPages.shared.status.teaching')
                        : t('ecosystemPages.shared.status.onLeave')}
                    </Badge>
                  ),
                },
              ]}
            />
          </TabsContent>

          <TabsContent value="classes">
            <EcosystemDataTable
              rows={data.classes}
              emptyMessage={t('ecosystemPages.trainingManagement.emptyClasses')}
              columns={[
                { key: 'name', header: t('ecosystemPages.shared.table.class') },
                { key: 'teacher', header: t('ecosystemPages.shared.table.teacher') },
                { key: 'schedule', header: t('ecosystemPages.shared.table.schedule') },
                {
                  key: 'students',
                  header: t('ecosystemPages.shared.table.capacity'),
                  render: (row) => `${row.students}/${row.capacity}`,
                },
                {
                  key: 'completionRate',
                  header: t('ecosystemPages.shared.table.progress'),
                  render: (row) => `${row.completionRate}%`,
                },
              ]}
            />
          </TabsContent>
        </Tabs>
      </EcosystemSection>
    </AppPageShell>
  );
}
