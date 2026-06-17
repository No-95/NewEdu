'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemMetricGrid } from '@/components/ecosystem/shared/EcosystemMetricGrid';
import { EcosystemDataTable } from '@/components/ecosystem/shared/EcosystemDataTable';
import { EcosystemActionBar } from '@/components/ecosystem/shared/EcosystemActionBar';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { EcosystemPageLoader } from '@/components/ecosystem/shared/EcosystemPageLoader';
import { useLanguage } from '@/lib/context/LanguageContext';
import { translateMetrics } from '@/lib/ecosystem/i18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CreateDepartmentDialog,
  CreateEmployeeDialog,
  CreateReviewDialog,
} from '@/components/ecosystem/business/EmployerOpsDialogs';

export function HrManagementClient({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState('employees');
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const data = useQuery(api.ecosystem.getHrDashboard, { email: userEmail });
  const completeReview = useMutation(api.employerOps.completeReview);

  if (data === undefined) {
    return (
      <EcosystemPageLoader
        title={t('ecosystemPages.hrManagement.title')}
        subtitle={t('ecosystemPages.hrManagement.subtitle')}
      />
    );
  }

  const metrics = translateMetrics(data.metrics, t, 'ecosystemPages.hrManagement.metrics');

  return (
    <AppPageShell
      title={t('ecosystemPages.hrManagement.title')}
      subtitle={t('ecosystemPages.hrManagement.subtitle')}
      actions={
        <EcosystemActionBar
          actions={[
            { label: t('employerOps.addEmployee'), variant: 'default', onClick: () => setEmployeeOpen(true) },
            { label: t('employerOps.addDepartment'), variant: 'outline', onClick: () => setDepartmentOpen(true) },
            { label: t('employerOps.addReview'), variant: 'outline', onClick: () => setReviewOpen(true) },
          ]}
        />
      }
    >
      <CreateEmployeeDialog userEmail={userEmail} open={employeeOpen} onOpenChange={setEmployeeOpen} />
      <CreateDepartmentDialog userEmail={userEmail} open={departmentOpen} onOpenChange={setDepartmentOpen} />
      <CreateReviewDialog userEmail={userEmail} open={reviewOpen} onOpenChange={setReviewOpen} />
      <EcosystemSection title={t('ecosystemPages.shared.overview')}>
        <EcosystemMetricGrid stats={metrics} />
      </EcosystemSection>

      <EcosystemSection title={t('ecosystemPages.hrManagement.managementSection')}>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4 bg-white/5">
            <TabsTrigger value="employees">{t('ecosystemPages.hrManagement.tabs.employees')}</TabsTrigger>
            <TabsTrigger value="departments">{t('ecosystemPages.hrManagement.tabs.departments')}</TabsTrigger>
            <TabsTrigger value="reviews">{t('ecosystemPages.hrManagement.tabs.reviews')}</TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <EcosystemDataTable
              rows={data.employees}
              emptyMessage={t('ecosystemPages.hrManagement.emptyEmployees')}
              columns={[
                { key: 'name', header: t('ecosystemPages.shared.table.name') },
                { key: 'department', header: t('ecosystemPages.shared.table.department') },
                { key: 'role', header: t('ecosystemPages.shared.table.role') },
                { key: 'joinDate', header: t('ecosystemPages.shared.table.joinDate') },
                {
                  key: 'status',
                  header: t('ecosystemPages.shared.table.status'),
                  render: (row) => (
                    <Badge
                      className={
                        row.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }
                    >
                      {row.status === 'active'
                        ? t('ecosystemPages.shared.status.active')
                        : t('ecosystemPages.shared.status.onLeave')}
                    </Badge>
                  ),
                },
              ]}
            />
          </TabsContent>

          <TabsContent value="departments">
            <EcosystemDataTable
              rows={data.departments}
              emptyMessage={t('ecosystemPages.hrManagement.emptyDepartments')}
              columns={[
                { key: 'name', header: t('ecosystemPages.shared.table.department') },
                { key: 'head', header: t('ecosystemPages.shared.table.head') },
                { key: 'employees', header: t('ecosystemPages.shared.table.staff') },
              ]}
            />
          </TabsContent>

          <TabsContent value="reviews">
            <EcosystemDataTable
              rows={data.reviews}
              emptyMessage={t('ecosystemPages.hrManagement.emptyReviews')}
              columns={[
                { key: 'employee', header: t('ecosystemPages.shared.table.name') },
                { key: 'period', header: t('ecosystemPages.shared.table.period') },
                {
                  key: 'rating',
                  header: t('ecosystemPages.shared.table.score'),
                  render: (row) => <span className="font-semibold text-primary">{row.rating}/5</span>,
                },
                {
                  key: 'status',
                  header: t('ecosystemPages.shared.table.status'),
                  render: (row) => (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-white/10">
                        {row.status === 'completed'
                          ? t('ecosystemPages.shared.status.completed')
                          : t('ecosystemPages.shared.status.draft')}
                      </Badge>
                      {row.status === 'draft' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            void completeReview({
                              email: userEmail,
                              reviewId: row.id as Id<'hrReviews'>,
                            })
                          }
                        >
                          {t('employerOps.completeReview')}
                        </Button>
                      ) : null}
                    </div>
                  ),
                },
              ]}
            />
          </TabsContent>
        </Tabs>
      </EcosystemSection>
    </AppPageShell>
  );
}
