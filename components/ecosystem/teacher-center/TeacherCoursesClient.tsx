'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { EcosystemPageLoader } from '@/components/ecosystem/shared/EcosystemPageLoader';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export function TeacherCoursesClient({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const courses = useQuery(api.courses.getCoursesByOwner, { email: userEmail });
  const createCourse = useMutation(api.courses.createTeacherCourse);
  const updateCourse = useMutation(api.courses.updateTeacherCourse);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [price, setPrice] = useState('0');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await createCourse({
        email: userEmail,
        title,
        subtitle,
        price: Number(price) || 0,
        published: false,
      });
      setTitle('');
      setSubtitle('');
      setPrice('0');
    } finally {
      setSaving(false);
    }
  };

  if (courses === undefined) {
    return (
      <EcosystemPageLoader
        title={t('teacherOps.myCourses')}
        subtitle={t('teacherOps.myCoursesSubtitle')}
      />
    );
  }

  return (
    <AppPageShell title={t('teacherOps.myCourses')} subtitle={t('teacherOps.myCoursesSubtitle')}>
      <EcosystemSection title={t('teacherOps.createCourse')}>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <Label htmlFor="course-title">{t('teacherOps.courseTitle')}</Label>
            <Input id="course-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="course-subtitle">{t('teacherOps.subtitle')}</Label>
            <Input id="course-subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="course-price">{t('teacherOps.price')}</Label>
            <Input id="course-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        </div>
        <Button type="button" className="mt-4" onClick={handleCreate} disabled={saving || !title || !subtitle}>
          {t('teacherOps.save')}
        </Button>
      </EcosystemSection>

      <EcosystemSection title={t('teacherOps.publishedCourses')}>
        {courses.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-muted-foreground">
            {t('teacherOps.noCoursesYet')}
          </div>
        ) : (
          <ul className="space-y-3">
            {courses.map((course) => (
              <li
                key={course._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-foreground">{course.title}</p>
                  <p className="text-xs text-muted-foreground">{course.subtitle}</p>
                  <p className="mt-1 text-xs text-primary">
                    {course.published ? t('teacherOps.published') : t('teacherOps.draft')} · {course.price.toLocaleString()} ₫
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/courses/${course.slug}`}>{t('teacherOps.viewCourse')}</Link>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      void updateCourse({
                        email: userEmail,
                        courseId: course._id as Id<'courses'>,
                        published: !course.published,
                      })
                    }
                  >
                    {course.published ? t('teacherOps.unpublish') : t('teacherOps.publish')}
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
