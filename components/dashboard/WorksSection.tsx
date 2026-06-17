'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  DashboardEmptyState,
  DashboardSection,
} from '@/components/dashboard/shared/DashboardPrimitives';

type HomeworkItem = {
  id: string;
  title: string;
  courseTitle: string;
  courseSlug?: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: number | null;
};

const DUE_SOON_MS = 3 * 24 * 60 * 60 * 1000;

function formatDueDate(timestamp: number | null, locale: string) {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDueUrgency(dueDate: number | null): 'overdue' | 'due-soon' | null {
  if (!dueDate) return null;
  const now = Date.now();
  if (dueDate < now) return 'overdue';
  if (dueDate - now <= DUE_SOON_MS) return 'due-soon';
  return null;
}

export function LearnerHomeworkList({
  items,
  userEmail,
}: {
  items: HomeworkItem[];
  userEmail?: string;
}) {
  const { t, language } = useLanguage();
  const locale = language === 'ko' ? 'ko-KR' : language === 'vi' ? 'vi-VN' : 'en-US';
  const completeHomework = useMutation(api.homeworks.completeHomework);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  if (items.length === 0) {
    return <DashboardEmptyState message={t('dashboard.learner.homeworkEmpty')} />;
  }

  const handleComplete = async (homeworkId: string) => {
    if (!userEmail) return;
    setCompletingId(homeworkId);
    try {
      const note = notes[homeworkId]?.trim();
      await completeHomework({
        learnerEmail: userEmail,
        homeworkId: homeworkId as Id<'homeworks'>,
        note: note || undefined,
      });
      setNotes((prev) => {
        const next = { ...prev };
        delete next[homeworkId];
        return next;
      });
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const urgency = getDueUrgency(item.dueDate);
        const cardClass =
          urgency === 'overdue'
            ? 'border-red-500/40 bg-red-500/10'
            : urgency === 'due-soon'
              ? 'border-amber-500/40 bg-amber-500/10'
              : 'border-white/10 bg-white/5';

        return (
          <li key={item.id} className={`rounded-lg border px-4 py-3 text-sm ${cardClass}`}>
            <p className="font-medium text-foreground">{item.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.courseSlug ? (
                <Link href={`/courses/${item.courseSlug}`} className="text-primary hover:underline">
                  {item.courseTitle}
                </Link>
              ) : (
                item.courseTitle
              )}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{t(`dashboard.learner.homeworkStatus.${item.status}`)}</span>
              {item.dueDate ? (
                <>
                  <span>·</span>
                  <span
                    className={
                      urgency === 'overdue'
                        ? 'font-medium text-red-400'
                        : urgency === 'due-soon'
                          ? 'font-medium text-amber-400'
                          : undefined
                    }
                  >
                    {urgency === 'overdue'
                      ? t('dashboard.learner.homeworkOverdue')
                      : urgency === 'due-soon'
                        ? t('dashboard.learner.homeworkDueSoon')
                        : t('dashboard.learner.homeworkDue')}
                    : {formatDueDate(item.dueDate, locale)}
                  </span>
                </>
              ) : null}
            </div>
            {userEmail && item.status !== 'completed' ? (
              <div className="mt-3 space-y-2">
                <textarea
                  value={notes[item.id] ?? ''}
                  onChange={(e) =>
                    setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                  }
                  placeholder={t('dashboard.learner.homeworkNotePlaceholder')}
                  rows={2}
                  className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => void handleComplete(item.id)}
                  disabled={completingId === item.id}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {completingId === item.id
                    ? t('dashboard.loadingData')
                    : t('dashboard.learner.completeHomework')}
                </button>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export default function WorksSection({ userEmail }: { userEmail: string }): React.ReactElement {
  const { t } = useLanguage();
  const data = useQuery(api.dashboard.getLearnerDashboard, { email: userEmail });

  return (
    <DashboardSection title={t('dashboard.learner.homeworkTitle')}>
      {data === undefined ? (
        <DashboardEmptyState message={t('dashboard.loadingData')} />
      ) : (
        <LearnerHomeworkList items={data.homeworkItems} userEmail={userEmail} />
      )}
    </DashboardSection>
  );
}
