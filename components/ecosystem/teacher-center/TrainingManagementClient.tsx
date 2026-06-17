'use client';

import { useState, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
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
import { downloadCsv, downloadTextFile } from '@/lib/utils/client-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AssignHomeworkDialog,
  CreateClassDialog,
  CreateStudentDialog,
} from '@/components/ecosystem/teacher-center/TeacherOpsDialogs';

type CsvPreviewRow = { name: string; studentEmail: string; className: string };

const CSV_TEMPLATE = 'Name,Email,Class\nNguyen Van A,student@example.com,Korean A1\nTran Thi B,student2@example.com,Korean A2';

function parseCsvRows(text: string): CsvPreviewRow[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  return lines.slice(1).map((line) => {
    const [name, email, className] = line.split(',').map((cell) => cell.trim());
    return { name: name ?? '', studentEmail: email ?? '', className: className ?? '' };
  });
}

export function TrainingManagementClient({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState('students');
  const [studentOpen, setStudentOpen] = useState(false);
  const [classOpen, setClassOpen] = useState(false);
  const [homeworkOpen, setHomeworkOpen] = useState(false);
  const data = useQuery(api.ecosystem.getTrainingManagementDashboard, { email: userEmail });
  const homework = useQuery(api.homeworks.listHomeworksByAssigner, { email: userEmail });
  const submissions = useQuery(api.homeworks.listHomeworksByAssigner, {
    email: userEmail,
    status: 'completed',
  });
  const importStudents = useMutation(api.teacherOps.importStudentsBatch);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRows, setPreviewRows] = useState<CsvPreviewRow[]>([]);
  const [importing, setImporting] = useState(false);

  const handleCsvImport = async (rows: CsvPreviewRow[]) => {
    setImporting(true);
    setImportMessage('');
    try {
      const result = await importStudents({ email: userEmail, rows });
      const errorSummary =
        result.errors.length > 0
          ? ` ${result.errors.length} error(s): ${result.errors.slice(0, 3).map((e) => `row ${e.row} (${e.reason})`).join('; ')}.`
          : '';
      setImportMessage(`Imported ${result.imported}, skipped ${result.skipped}.${errorSummary}`);
      setPreviewOpen(false);
      setPreviewRows([]);
    } finally {
      setImporting(false);
    }
  };

  const handleFileSelected = async (file: File) => {
    setImportMessage('');
    const text = await file.text();
    const rows = parseCsvRows(text);
    setPreviewRows(rows);
    setPreviewOpen(true);
  };

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
            {
              label: t('ecosystemPages.trainingManagement.actions.createClass'),
              variant: 'default',
              onClick: () => setClassOpen(true),
            },
            {
              label: t('ecosystemPages.trainingManagement.actions.addStudent'),
              variant: 'outline',
              onClick: () => setStudentOpen(true),
            },
            {
              label: t('teacherOps.assignHomework'),
              variant: 'outline',
              onClick: () => setHomeworkOpen(true),
            },
            {
              label: t('employerOps.importStudentsCsv'),
              variant: 'outline',
              onClick: () => csvInputRef.current?.click(),
            },
            {
              label: t('teacherOps.downloadCsvTemplate'),
              variant: 'outline',
              onClick: () => downloadTextFile('students-import-template.csv', CSV_TEMPLATE, 'text/csv;charset=utf-8'),
            },
            {
              label: t('ecosystemPages.trainingManagement.actions.exportReport'),
              variant: 'outline',
              onClick: () => {
                downloadCsv(
                  'training-students-report.csv',
                  data.students.map((student) => ({
                    name: student.name,
                    email: student.email,
                    className: student.className,
                    status: student.status,
                    attendanceRate: student.attendanceRate,
                  })),
                  [
                    { key: 'name', label: 'Name' },
                    { key: 'email', label: 'Email' },
                    { key: 'className', label: 'Class' },
                    { key: 'status', label: 'Status' },
                    { key: 'attendanceRate', label: 'Attendance %' },
                  ]
                );
              },
            },
          ]}
        />
      }
    >
      <input
        ref={csvInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFileSelected(file);
          e.target.value = '';
        }}
      />
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('teacherOps.csvPreviewTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t('teacherOps.csvPreviewSubtitle', {
              params: { total: previewRows.length, shown: Math.min(5, previewRows.length) },
            })}
          </p>
          <EcosystemDataTable
            rows={previewRows.slice(0, 5).map((row, index) => ({
              id: String(index),
              name: row.name,
              email: row.studentEmail,
              className: row.className,
            }))}
            emptyMessage={t('teacherOps.csvPreviewEmpty')}
            columns={[
              { key: 'name', header: t('ecosystemPages.shared.table.name') },
              { key: 'email', header: t('ecosystemPages.shared.table.email') },
              { key: 'className', header: t('ecosystemPages.shared.table.class') },
            ]}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              {t('teacherOps.cancelImport')}
            </Button>
            <Button disabled={importing || previewRows.length === 0} onClick={() => void handleCsvImport(previewRows)}>
              {importing ? t('ecosystemPages.shared.saving') : t('teacherOps.confirmImport')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {importMessage ? <p className="mb-4 text-sm text-muted-foreground">{importMessage}</p> : null}
      <CreateStudentDialog userEmail={userEmail} open={studentOpen} onOpenChange={setStudentOpen} />
      <CreateClassDialog userEmail={userEmail} open={classOpen} onOpenChange={setClassOpen} />
      <AssignHomeworkDialog userEmail={userEmail} open={homeworkOpen} onOpenChange={setHomeworkOpen} />

      <EcosystemSection title={t('ecosystemPages.shared.overview')}>
        <EcosystemMetricGrid stats={metrics} />
      </EcosystemSection>

      <EcosystemSection title={t('ecosystemPages.trainingManagement.modulesSection')}>
        <EcosystemModuleGrid
          modules={trainingModules}
          onModuleClick={(moduleId) => setTab(moduleId)}
        />
      </EcosystemSection>

      <EcosystemSection title={t('teacherOps.assignedHomework')}>
        {(homework ?? []).length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-muted-foreground">
            {t('teacherOps.noHomeworkAssigned')}
          </div>
        ) : (
          <EcosystemDataTable
            rows={homework ?? []}
            emptyMessage={t('teacherOps.noHomeworkAssigned')}
            columns={[
              { key: 'title', header: t('teacherOps.homeworkTitle') },
              { key: 'assigneeEmail', header: t('teacherOps.learnerEmail') },
              { key: 'status', header: t('ecosystemPages.shared.table.status') },
            ]}
          />
        )}
      </EcosystemSection>

      <EcosystemSection title={t('ecosystemPages.trainingManagement.dataSection')}>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4 bg-white/5">
            <TabsTrigger value="students">{t('ecosystemPages.trainingManagement.tabs.students')}</TabsTrigger>
            <TabsTrigger value="teachers">{t('ecosystemPages.trainingManagement.tabs.teachers')}</TabsTrigger>
            <TabsTrigger value="classes">{t('ecosystemPages.trainingManagement.tabs.classes')}</TabsTrigger>
            <TabsTrigger value="submissions">{t('ecosystemPages.trainingManagement.tabs.submissions')}</TabsTrigger>
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

          <TabsContent value="submissions">
            <EcosystemDataTable
              rows={submissions ?? []}
              emptyMessage={t('ecosystemPages.trainingManagement.emptySubmissions')}
              columns={[
                { key: 'title', header: t('teacherOps.homeworkTitle') },
                { key: 'assigneeName', header: t('ecosystemPages.shared.table.name') },
                {
                  key: 'learnerNote',
                  header: t('teacherOps.learnerNote'),
                  render: (row) => row.learnerNote?.trim() || '—',
                },
                {
                  key: 'completedAt',
                  header: t('teacherOps.completedAt'),
                  render: (row) =>
                    row.completedAt ? new Date(row.completedAt).toLocaleDateString() : '—',
                },
              ]}
            />
          </TabsContent>
        </Tabs>
      </EcosystemSection>
    </AppPageShell>
  );
}
