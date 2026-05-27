'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { groupLecturesByUnit } from '@/lib/courses/outline';
import { useLanguage } from '@/lib/context/LanguageContext';
import { COURSE_TEXT, LECTURE_TITLES, UNIT_TITLES, getCourseLanguage } from '@/lib/courses/localization';
import { useCourseProgress } from '@/hooks/useCourseProgress';

interface CourseOutlineSidebarProps {
  courseId: string;
  title?: string;
  lectures: Array<{
    title: string;
    description: string;
    videoFolderName: string;
  }>;
  activeVideoId?: string;
}

export function CourseOutlineSidebar({ courseId, title, lectures, activeVideoId }: CourseOutlineSidebarProps) {
  const { language } = useLanguage();
  const locale = getCourseLanguage(language);
  const text = COURSE_TEXT[locale].outline;
  const { isCompleted } = useCourseProgress(courseId);
  const units = groupLecturesByUnit(
    lectures.map((lecture) => ({
      id: lecture.videoFolderName,
      title: lecture.title,
      description: lecture.description,
      classId: courseId,
      teacherId: '',
      videoFolderName: lecture.videoFolderName,
    }))
  );

  return (
    <aside className="lg:sticky lg:top-24 h-fit">
      <div className="rounded-2xl border border-border/50 bg-background/70 p-5 backdrop-blur-sm">
        <div className="mb-4 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{text.title}</p>
          <h2 className="text-lg font-bold text-foreground">{title || text.subtitle}</h2>
          <p className="text-sm text-muted-foreground">{text.sortedHint}</p>
        </div>

        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
          <Accordion type="multiple" defaultValue={[`unit-${units[0]?.unit ?? 1}`]} className="w-full">
            {units.map((unit) => (
              <AccordionItem key={unit.unit} value={`unit-${unit.unit}`} className="border-border/40">
                <AccordionTrigger className="py-3 text-sm font-semibold text-foreground hover:no-underline">
                  {UNIT_TITLES[locale][unit.unit] ?? `${text.unitFallbackPrefix} ${unit.unit}`}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {unit.lectures.map((lecture) => {
                      const isActive = lecture.id === activeVideoId;
                      const isDone = isCompleted(lecture.videoFolderName);
                      const lectureDisplayTitle =
                        LECTURE_TITLES[locale][lecture.lecture] ??
                        lecture.title ??
                        `${text.lecturePrefix} ${lecture.lecture}`;

                      return (
                        <Link
                          key={lecture.id}
                          href={`/courses/${courseId}/${lecture.videoFolderName}`}
                          className={cn(
                            'block rounded-xl border px-3 py-2.5 transition-colors',
                            isActive
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border/50 bg-background/40 text-foreground hover:border-primary/50 hover:bg-muted/40'
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                {text.lecturePrefix} {lecture.lecture}
                              </p>
                              <p className="truncate text-sm font-medium">{lectureDisplayTitle}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              {isDone ? <Check className="h-4 w-4 text-emerald-400" /> : null}
                              <span className="text-xs text-muted-foreground">{lecture.videoFolderName}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </aside>
  );
}
