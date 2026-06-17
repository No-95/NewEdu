'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
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

export function CreateStudentDialog({ userEmail, open, onOpenChange }: DialogProps) {
  const { t } = useLanguage();
  const createStudent = useMutation(api.teacherOps.createStudent);
  const [name, setName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [className, setClassName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await createStudent({ email: userEmail, name, studentEmail, className });
      onOpenChange(false);
      setName('');
      setStudentEmail('');
      setClassName('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('teacherOps.addStudent')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="student-name">{t('teacherOps.studentName')}</Label>
            <Input id="student-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="student-email">{t('teacherOps.studentEmail')}</Label>
            <Input id="student-email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="student-class">{t('teacherOps.className')}</Label>
            <Input id="student-class" value={className} onChange={(e) => setClassName(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={saving || !name || !studentEmail || !className}>
            {t('teacherOps.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreateClassDialog({ userEmail, open, onOpenChange }: DialogProps) {
  const { t } = useLanguage();
  const createClass = useMutation(api.teacherOps.createClass);
  const [name, setName] = useState('');
  const [teacher, setTeacher] = useState('');
  const [schedule, setSchedule] = useState('');
  const [capacity, setCapacity] = useState('20');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await createClass({
        email: userEmail,
        name,
        teacher,
        schedule,
        capacity: Number(capacity) || 20,
      });
      onOpenChange(false);
      setName('');
      setTeacher('');
      setSchedule('');
      setCapacity('20');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('teacherOps.createClass')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="class-name">{t('teacherOps.classTitle')}</Label>
            <Input id="class-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="class-teacher">{t('teacherOps.instructor')}</Label>
            <Input id="class-teacher" value={teacher} onChange={(e) => setTeacher(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="class-schedule">{t('teacherOps.schedule')}</Label>
            <Input id="class-schedule" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="class-capacity">{t('teacherOps.capacity')}</Label>
            <Input id="class-capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={saving || !name || !teacher || !schedule}>
            {t('teacherOps.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreateLeadDialog({ userEmail, open, onOpenChange }: DialogProps) {
  const { t } = useLanguage();
  const createLead = useMutation(api.teacherOps.createLead);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [followUpDate, setFollowUpDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await createLead({
        email: userEmail,
        name,
        phone,
        source,
        leadEmail: leadEmail || undefined,
        followUpDate,
        notes,
      });
      onOpenChange(false);
      setName('');
      setPhone('');
      setSource('');
      setLeadEmail('');
      setNotes('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('teacherOps.addLead')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="lead-name">{t('teacherOps.leadName')}</Label>
            <Input id="lead-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="lead-phone">{t('teacherOps.phone')}</Label>
            <Input id="lead-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="lead-source">{t('teacherOps.source')}</Label>
            <Input id="lead-source" value={source} onChange={(e) => setSource(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="lead-email">{t('teacherOps.leadEmail')}</Label>
            <Input id="lead-email" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="lead-followup">{t('teacherOps.followUpDate')}</Label>
            <Input id="lead-followup" type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="lead-notes">{t('teacherOps.notes')}</Label>
            <Textarea id="lead-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={saving || !name || !phone || !source}>
            {t('teacherOps.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreatePartnerDialog({ userEmail, open, onOpenChange }: DialogProps) {
  const { t } = useLanguage();
  const createPartner = useMutation(api.teacherOps.createPartner);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [commission, setCommission] = useState('10%');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await createPartner({ email: userEmail, name, type, commission });
      onOpenChange(false);
      setName('');
      setType('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('teacherOps.addPartner')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="partner-name">{t('teacherOps.partnerName')}</Label>
            <Input id="partner-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="partner-type">{t('teacherOps.partnerType')}</Label>
            <Input id="partner-type" value={type} onChange={(e) => setType(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="partner-commission">{t('teacherOps.commission')}</Label>
            <Input id="partner-commission" value={commission} onChange={(e) => setCommission(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={saving || !name || !type}>
            {t('teacherOps.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AssignHomeworkDialog({ userEmail, open, onOpenChange }: DialogProps) {
  const { t } = useLanguage();
  const assignHomework = useMutation(api.homeworks.assignHomeworkByEmail);
  const [learnerEmail, setLearnerEmail] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await assignHomework({
        assignerEmail: userEmail,
        learnerEmail,
        title,
        description: description || undefined,
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
      });
      onOpenChange(false);
      setLearnerEmail('');
      setTitle('');
      setDescription('');
      setDueDate('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('teacherOps.assignHomework')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="hw-learner">{t('teacherOps.learnerEmail')}</Label>
            <Input id="hw-learner" value={learnerEmail} onChange={(e) => setLearnerEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="hw-title">{t('teacherOps.homeworkTitle')}</Label>
            <Input id="hw-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="hw-desc">{t('teacherOps.description')}</Label>
            <Textarea id="hw-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="hw-due">{t('teacherOps.dueDate')}</Label>
            <Input id="hw-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={saving || !learnerEmail || !title}>
            {t('teacherOps.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
