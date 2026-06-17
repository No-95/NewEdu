'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/lib/context/LanguageContext';

type DialogProps = {
  userEmail: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateJobPostingDialog({ userEmail, open, onOpenChange }: DialogProps) {
  const { t } = useLanguage();
  const createJob = useMutation(api.employerOps.createJobPosting);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDepartment('');
    setLocation('');
    setSalary('');
    setDescription('');
  };

  const handleSubmit = async (asDraft: boolean) => {
    setSaving(true);
    try {
      await createJob({
        email: userEmail,
        title,
        department,
        location: location || undefined,
        salary: salary || undefined,
        description: description || undefined,
        status: asDraft ? 'draft' : 'open',
      });
      onOpenChange(false);
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('employerOps.postJob')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="job-title">{t('employerOps.jobTitle')}</Label>
            <Input id="job-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="job-dept">{t('employerOps.department')}</Label>
            <Input id="job-dept" value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="job-location">{t('employerOps.location')}</Label>
            <Input id="job-location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="job-salary">{t('employerOps.salary')}</Label>
            <Input id="job-salary" value={salary} onChange={(e) => setSalary(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="job-desc">{t('employerOps.description')}</Label>
            <Textarea id="job-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleSubmit(true)}
            disabled={saving || !title || !department}
          >
            {t('employerOps.saveAsDraft')}
          </Button>
          <Button onClick={() => void handleSubmit(false)} disabled={saving || !title || !department}>
            {t('employerOps.publishJob')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type JobPostingForm = {
  id: string;
  title: string;
  department: string;
  location?: string;
  salary?: string;
  description?: string;
};

export function EditJobPostingDialog({
  userEmail,
  open,
  onOpenChange,
  jobPosting,
}: DialogProps & { jobPosting: JobPostingForm | null }) {
  const { t } = useLanguage();
  const updateJob = useMutation(api.employerOps.updateJobPosting);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (nextOpen && jobPosting) {
      setTitle(jobPosting.title);
      setDepartment(jobPosting.department);
      setLocation(jobPosting.location ?? '');
      setSalary(jobPosting.salary ?? '');
      setDescription(jobPosting.description ?? '');
    }
  };

  const handleSubmit = async () => {
    if (!jobPosting) return;
    setSaving(true);
    try {
      await updateJob({
        email: userEmail,
        jobPostingId: jobPosting.id as Id<'recruitmentJobPostings'>,
        title,
        department,
        location: location || undefined,
        salary: salary || undefined,
        description: description || undefined,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('employerOps.editJob')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="edit-job-title">{t('employerOps.jobTitle')}</Label>
            <Input id="edit-job-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="edit-job-dept">{t('employerOps.department')}</Label>
            <Input id="edit-job-dept" value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="edit-job-location">{t('employerOps.location')}</Label>
            <Input id="edit-job-location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="edit-job-salary">{t('employerOps.salary')}</Label>
            <Input id="edit-job-salary" value={salary} onChange={(e) => setSalary(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="edit-job-desc">{t('employerOps.description')}</Label>
            <Textarea id="edit-job-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={saving || !title || !department}>
            {t('employerOps.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreateCandidateDialog({
  userEmail,
  open,
  onOpenChange,
  jobPostings,
}: DialogProps & {
  jobPostings: { id: string; title: string }[];
}) {
  const { t } = useLanguage();
  const createCandidate = useMutation(api.employerOps.createCandidate);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [score, setScore] = useState('70');
  const [jobPostingId, setJobPostingId] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await createCandidate({
        email: userEmail,
        name,
        position,
        score: Number(score) || 0,
        jobPostingId: jobPostingId ? (jobPostingId as Id<'recruitmentJobPostings'>) : undefined,
      });
      onOpenChange(false);
      setName('');
      setPosition('');
      setScore('70');
      setJobPostingId('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('employerOps.addCandidate')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="cand-name">{t('employerOps.candidateName')}</Label>
            <Input id="cand-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="cand-position">{t('employerOps.position')}</Label>
            <Input id="cand-position" value={position} onChange={(e) => setPosition(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="cand-score">{t('employerOps.score')}</Label>
            <Input id="cand-score" type="number" value={score} onChange={(e) => setScore(e.target.value)} />
          </div>
          {jobPostings.length > 0 ? (
            <div>
              <Label htmlFor="cand-job">{t('employerOps.linkedJob')}</Label>
              <select
                id="cand-job"
                value={jobPostingId}
                onChange={(e) => setJobPostingId(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
              >
                <option value="">{t('employerOps.noLinkedJob')}</option>
                {jobPostings.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={saving || !name || !position}>
            {t('employerOps.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreateEmployeeDialog({ userEmail, open, onOpenChange }: DialogProps) {
  const { t } = useLanguage();
  const createEmployee = useMutation(api.employerOps.createEmployee);
  const [name, setName] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await createEmployee({
        email: userEmail,
        name,
        employeeEmail: employeeEmail || undefined,
        department,
        role,
      });
      onOpenChange(false);
      setName('');
      setEmployeeEmail('');
      setDepartment('');
      setRole('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('employerOps.addEmployee')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="emp-name">{t('employerOps.employeeName')}</Label>
            <Input id="emp-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="emp-email">{t('ecosystemPages.shared.table.email')}</Label>
            <Input
              id="emp-email"
              type="email"
              value={employeeEmail}
              onChange={(e) => setEmployeeEmail(e.target.value)}
              placeholder="employee@example.com"
            />
          </div>
          <div>
            <Label htmlFor="emp-dept">{t('employerOps.department')}</Label>
            <Input id="emp-dept" value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="emp-role">{t('employerOps.role')}</Label>
            <Input id="emp-role" value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={saving || !name || !department || !role}>
            {t('employerOps.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreateDepartmentDialog({ userEmail, open, onOpenChange }: DialogProps) {
  const { t } = useLanguage();
  const createDepartment = useMutation(api.employerOps.createDepartment);
  const [name, setName] = useState('');
  const [head, setHead] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await createDepartment({ email: userEmail, name, head });
      onOpenChange(false);
      setName('');
      setHead('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('employerOps.addDepartment')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="dept-name">{t('employerOps.departmentName')}</Label>
            <Input id="dept-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="dept-head">{t('employerOps.departmentHead')}</Label>
            <Input id="dept-head" value={head} onChange={(e) => setHead(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={saving || !name || !head}>
            {t('employerOps.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreateInternalCourseDialog({ userEmail, open, onOpenChange }: DialogProps) {
  const { t } = useLanguage();
  const createCourse = useMutation(api.employerOps.createInternalCourse);
  const [title, setTitle] = useState('');
  const [capacity, setCapacity] = useState('30');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await createCourse({
        email: userEmail,
        title,
        capacity: Number(capacity) || 30,
      });
      onOpenChange(false);
      setTitle('');
      setCapacity('30');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('employerOps.addCourse')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="course-title">{t('employerOps.courseTitle')}</Label>
            <Input id="course-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="course-capacity">{t('employerOps.capacity')}</Label>
            <Input id="course-capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={saving || !title}>
            {t('employerOps.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreateReviewDialog({ userEmail, open, onOpenChange }: DialogProps) {
  const { t } = useLanguage();
  const createReview = useMutation(api.employerOps.createReview);
  const [employee, setEmployee] = useState('');
  const [period, setPeriod] = useState('');
  const [rating, setRating] = useState('4');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await createReview({
        email: userEmail,
        employee,
        period,
        rating: Number(rating) || 4,
      });
      onOpenChange(false);
      setEmployee('');
      setPeriod('');
      setRating('4');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('employerOps.addReview')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="review-employee">{t('employerOps.employeeName')}</Label>
            <Input id="review-employee" value={employee} onChange={(e) => setEmployee(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="review-period">{t('employerOps.reviewPeriod')}</Label>
            <Input id="review-period" value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="Q1 2026" />
          </div>
          <div>
            <Label htmlFor="review-rating">{t('employerOps.reviewRating')}</Label>
            <Input id="review-rating" type="number" min={1} max={5} value={rating} onChange={(e) => setRating(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={saving || !employee || !period}>
            {t('employerOps.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UpdateEmployeeProgressDialog({
  userEmail,
  open,
  onOpenChange,
  defaultEmployeeName = '',
  defaultProgress = '0',
}: DialogProps & {
  defaultEmployeeName?: string;
  defaultProgress?: string;
}) {
  const { t } = useLanguage();
  const upsertProgress = useMutation(api.employerOps.upsertEmployeeProgress);
  const [employeeName, setEmployeeName] = useState(defaultEmployeeName);
  const [progress, setProgress] = useState(defaultProgress);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await upsertProgress({
        email: userEmail,
        employeeName,
        progress: Number(progress) || 0,
      });
      onOpenChange(false);
      setEmployeeName('');
      setProgress('0');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (nextOpen) {
          setEmployeeName(defaultEmployeeName);
          setProgress(defaultProgress);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('employerOps.updateProgress')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="progress-employee">{t('employerOps.employeeName')}</Label>
            <Input id="progress-employee" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="progress-value">{t('employerOps.progressPercent')}</Label>
            <Input
              id="progress-value"
              type="number"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={saving || !employeeName}>
            {t('employerOps.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AssignPlatformCourseDialog({ userEmail, open, onOpenChange }: DialogProps) {
  const { t } = useLanguage();
  const hrData = useQuery(api.ecosystem.getHrDashboard, open ? { email: userEmail } : 'skip');
  const courses = useQuery(api.courses.getPublishedCourses, open ? {} : 'skip');
  const assignCourse = useMutation(api.employerOps.assignPlatformCourseToEmployee);
  const [employeeId, setEmployeeId] = useState('');
  const [courseSlug, setCourseSlug] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!employeeId || !courseSlug) return;
    setSaving(true);
    try {
      await assignCourse({
        email: userEmail,
        employeeId: employeeId as Id<'hrEmployees'>,
        courseSlug,
      });
      onOpenChange(false);
      setEmployeeId('');
      setCourseSlug('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('employerOps.assignPlatformCourse')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="assign-employee">{t('employerOps.employeeName')}</Label>
            <select
              id="assign-employee"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              <option value="">{t('employerOps.selectEmployee')}</option>
              {(hrData?.employees ?? []).map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="assign-course">{t('employerOps.platformCourse')}</Label>
            <select
              id="assign-course"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={courseSlug}
              onChange={(e) => setCourseSlug(e.target.value)}
            >
              <option value="">{t('employerOps.selectCourse')}</option>
              {(courses ?? []).map((course) => (
                <option key={course.slug} value={course.slug}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={saving || !employeeId || !courseSlug}>
            {t('employerOps.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
