'use client';

import Link from 'next/link';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import type { CourseMetadata } from '@/lib/data/courses';
import { groupLecturesByUnit } from '@/lib/courses/outline';

interface CourseOutlineSidebarProps {
  course: CourseMetadata;
  activeVideoId?: string;
}

export function CourseOutlineSidebar({ course, activeVideoId }: CourseOutlineSidebarProps) {
  const units = groupLecturesByUnit(course.lectures);

  return (
    <aside className="lg:sticky lg:top-24 h-fit">
      <div className="rounded-2xl border border-border/50 bg-background/70 p-5 backdrop-blur-sm">
        <div className="mb-4 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Course Outline</p>
          <h2 className="text-lg font-bold text-foreground">Units and lectures</h2>
          <p className="text-sm text-muted-foreground">Lectures are sorted by numeric Unit and Lecture order.</p>
        </div>

        <Accordion type="multiple" defaultValue={[`unit-${units[0]?.unit ?? 1}`]} className="w-full">
          {units.map((unit) => (
            <AccordionItem key={unit.unit} value={`unit-${unit.unit}`} className="border-border/40">
              <AccordionTrigger className="py-3 text-sm font-semibold text-foreground hover:no-underline">
                Unit {unit.unit}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {unit.lectures.map((lecture) => {
                    const isActive = lecture.id === activeVideoId;

                    return (
                      <Link
                        key={lecture.id}
                        href={`/courses/${course.id}/${lecture.id}`}
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
                              Lecture {lecture.lecture}
                            </p>
                            <p className="truncate text-sm font-medium">{lecture.title}</p>
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">{lecture.videoFolderName}</span>
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
    </aside>
  );
}
