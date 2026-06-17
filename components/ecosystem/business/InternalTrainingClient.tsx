'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemMetricGrid } from '@/components/ecosystem/shared/EcosystemMetricGrid';
import { EcosystemDataTable } from '@/components/ecosystem/shared/EcosystemDataTable';
import { EcosystemActionBar } from '@/components/ecosystem/shared/EcosystemActionBar';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { EcosystemPageLoader } from '@/components/ecosystem/shared/EcosystemPageLoader';
import { useLanguage } from '@/lib/context/LanguageContext';
import { translateMetrics } from '@/lib/ecosystem/i18n';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreateInternalCourseDialog, UpdateEmployeeProgressDialog, AssignPlatformCourseDialog } from '@/components/ecosystem/business/EmployerOpsDialogs';

export function InternalTrainingClient({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const [courseOpen, setCourseOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [progressEmployee, setProgressEmployee] = useState('');
  const [progressValue, setProgressValue] = useState('0');
  const data = useQuery(api.ecosystem.getInternalTrainingDashboard, { email: userEmail });

  if (data === undefined) {
    return (
      <EcosystemPageLoader
        title={t('ecosystemPages.internalTraining.title')}
        subtitle={t('ecosystemPages.internalTraining.subtitle')}
      />
    );
  }

  const metrics = translateMetrics(data.metrics, t, 'ecosystemPages.internalTraining.metrics');

  return (
    <AppPageShell
      title={t('ecosystemPages.internalTraining.title')}
      subtitle={t('ecosystemPages.internalTraining.subtitle')}
      actions={
        <EcosystemActionBar
          actions={[
            { label: t('employerOps.addCourse'), variant: 'default', onClick: () => setCourseOpen(true) },
            { label: t('employerOps.updateProgress'), variant: 'outline', onClick: () => {
              setProgressEmployee('');
              setProgressValue('0');
              setProgressOpen(true);
            }},
            { label: t('employerOps.assignPlatformCourse'), variant: 'outline', onClick: () => setAssignOpen(true) },
          ]}
        />
      }
    >
      <CreateInternalCourseDialog userEmail={userEmail} open={courseOpen} onOpenChange={setCourseOpen} />
      <UpdateEmployeeProgressDialog
        userEmail={userEmail}
        open={progressOpen}
        onOpenChange={setProgressOpen}
        defaultEmployeeName={progressEmployee}
        defaultProgress={progressValue}
      />
      <AssignPlatformCourseDialog userEmail={userEmail} open={assignOpen} onOpenChange={setAssignOpen} />
      <EcosystemSection title={t('ecosystemPages.shared.dashboard')}>
        <EcosystemMetricGrid stats={metrics} />
      </EcosystemSection>

      <EcosystemSection title={t('ecosystemPages.internalTraining.coursesSection')}>
        <EcosystemDataTable
          rows={data.courses}
          emptyMessage={t('ecosystemPages.internalTraining.emptyCourses')}
          columns={[
            { key: 'title', header: t('ecosystemPages.shared.table.course') },
            {
              key: 'enrolled',
              header: t('ecosystemPages.shared.table.enrolled'),
              render: (row) => `${row.enrolled} ${t('ecosystemPages.shared.people')}`,
            },
            {
              key: 'completed',
              header: t('ecosystemPages.shared.table.progress'),
              render: (row) => {
                const pct = row.enrolled > 0 ? Math.round((row.completed / row.enrolled) * 100) : 0;
                return (
                  <div className="flex items-center gap-2">
                    <Progress value={pct} className="h-2 w-24" />
                    <span className="text-xs">
                      {row.completed}/{row.enrolled}
                    </span>
                  </div>
                );
              },
            },
            {
              key: 'compliance',
              header: t('ecosystemPages.shared.table.compliance'),
              render: (row) => (
                <Badge className={row.compliance ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10'}>
                  {row.compliance ? t('ecosystemPages.shared.required') : t('ecosystemPages.shared.optional')}
                </Badge>
              ),
            },
          ]}
        />
      </EcosystemSection>

      <EcosystemSection title={t('ecosystemPages.internalTraining.progressSection')}>
        {data.employeeProgress.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-muted-foreground">
            {t('ecosystemPages.internalTraining.emptyProgress')}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.employeeProgress.map((emp) => (
              <button
                key={emp.id}
                type="button"
                className="home-card-muted text-left transition-colors hover:border-primary/30"
                onClick={() => {
                  setProgressEmployee(emp.name);
                  setProgressValue(String(emp.progress));
                  setProgressOpen(true);
                }}
              >
                <p className="font-medium">{emp.name}</p>
                <Progress value={emp.progress} className="mt-3 h-2" />
                <p className="mt-1 text-xs text-primary">
                  {t('ecosystemPages.shared.completion')} {emp.progress}%
                </p>
              </button>
            ))}
          </div>
        )}
      </EcosystemSection>
    </AppPageShell>
  );
}
