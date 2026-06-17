'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useLanguage } from '@/lib/context/LanguageContext';
import { AcceptConsultationDialog } from '@/components/ecosystem/experts/AcceptConsultationDialog';
import {
  DashboardActionRow,
  DashboardBulletList,
  DashboardChipList,
  DashboardGrid,
  DashboardKeyValueList,
  DashboardLoadingState,
  DashboardNextStepCta,
  DashboardSection,
  DashboardStatGrid,
} from '@/components/dashboard/shared/DashboardPrimitives';

export function ExpertDashboard({ userEmail }: { userEmail: string }) {
  const { t } = useLanguage();
  const data = useQuery(api.dashboard.getExpertDashboard, { email: userEmail });
  const updateStatus = useMutation(api.experts.updateConsultationRequestStatus);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [acceptTarget, setAcceptTarget] = useState<string | null>(null);

  if (data === undefined) {
    return <DashboardLoadingState />;
  }

  const handleClose = async (requestId: string) => {
    setUpdatingId(requestId);
    try {
      await updateStatus({
        expertEmail: userEmail,
        requestId: requestId as Id<'expertConsultationRequests'>,
        status: 'closed',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAcceptConfirm = async (
    requestId: string,
    values: {
      scheduledStart: number;
      scheduledEnd: number;
      meetingUrl?: string;
      timezone: string;
    }
  ) => {
    setUpdatingId(requestId);
    try {
      await updateStatus({
        expertEmail: userEmail,
        requestId: requestId as Id<'expertConsultationRequests'>,
        status: 'accepted',
        scheduledStart: values.scheduledStart,
        scheduledEnd: values.scheduledEnd,
        meetingUrl: values.meetingUrl,
        timezone: values.timezone,
      });
      setAcceptTarget(null);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      {data.nextStep ? (
        <DashboardNextStepCta labelKey={data.nextStep.labelKey} href={data.nextStep.href} />
      ) : null}
      <AcceptConsultationDialog
        open={acceptTarget !== null}
        onOpenChange={(open) => {
          if (!open) setAcceptTarget(null);
        }}
        loading={updatingId !== null}
        onConfirm={(values) =>
          acceptTarget ? handleAcceptConfirm(acceptTarget, values) : Promise.resolve()
        }
      />
      <DashboardGrid>
        <DashboardSection title={t('dashboard.expert.profileTitle')} span={2} delay={0.05}>
          <DashboardKeyValueList
            rows={[
              { label: t('dashboard.expert.headline'), value: data.headline },
              {
                label: t('dashboard.expert.profileStatus'),
                value: data.profilePublished ? t('dashboard.expert.published') : t('dashboard.expert.draft'),
              },
            ]}
          />
          <div className="mt-6">
            <DashboardActionRow
              actions={[
                { label: t('dashboard.expert.editProfile'), href: '/experts/profile', primary: true },
                { label: t('dashboard.expert.viewNetwork'), href: '/experts/network' },
              ]}
            />
          </div>
        </DashboardSection>

        <DashboardSection title={t('dashboard.expert.consultingTitle')} delay={0.1}>
          <DashboardStatGrid
            stats={[
              { label: t('dashboard.expert.newRequests'), value: data.newRequests, accent: true },
              { label: t('dashboard.expert.weeklyRequests'), value: data.weeklyRequests },
            ]}
          />
        </DashboardSection>

        <DashboardSection title={t('dashboard.expert.inboxTitle')} span={2} delay={0.12}>
          {data.inbox.length > 0 ? (
            <ul className="space-y-3">
              {data.inbox.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm"
                >
                  <p className="font-medium text-foreground">{item.topic}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-xs capitalize text-muted-foreground">{item.status}</p>
                  {item.scheduledStart ? (
                    <p className="mt-1 text-xs text-primary">
                      {new Date(item.scheduledStart).toLocaleString(undefined, {
                        timeZone: item.timezone || undefined,
                      })}
                    </p>
                  ) : null}
                  {item.status === 'new' || item.status === 'accepted' ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.status === 'new' ? (
                        <button
                          type="button"
                          disabled={updatingId === item.id}
                          onClick={() => setAcceptTarget(item.id)}
                          className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                        >
                          {t('dashboard.expert.acceptRequest')}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={updatingId === item.id}
                        onClick={() => void handleClose(item.id)}
                        className="rounded-md border border-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/5 disabled:opacity-60"
                      >
                        {t('dashboard.expert.closeRequest')}
                      </button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{t('dashboard.expert.emptyInbox')}</p>
          )}
        </DashboardSection>

        <DashboardSection title={t('dashboard.expert.contentMgmtTitle')} delay={0.14} action={t('dashboard.viewAll')} actionHref="/events">
          {data.contentItems.length > 0 ? (
            <DashboardBulletList items={data.contentItems.map((item) => item.label)} />
          ) : (
            <p className="text-sm text-muted-foreground">{t('dashboard.expert.emptyContent')}</p>
          )}
        </DashboardSection>

        <DashboardSection title={t('dashboard.expert.expertiseTitle')} delay={0.16}>
          {data.expertise.length > 0 ? (
            <DashboardChipList items={data.expertise} />
          ) : (
            <p className="text-sm text-muted-foreground">{t('dashboard.expert.emptyExpertise')}</p>
          )}
        </DashboardSection>
      </DashboardGrid>
    </>
  );
}
