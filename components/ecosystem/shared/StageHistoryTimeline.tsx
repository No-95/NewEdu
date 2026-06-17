'use client';

import { useLanguage } from '@/lib/context/LanguageContext';

type StageEvent = {
  fromStage?: string;
  toStage: string;
  createdAt: number;
};

export function StageHistoryTimeline({ events }: { events: StageEvent[] }) {
  const { t } = useLanguage();

  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('ecosystemPages.careerApplicationDetail.stageHistory.empty')}
      </p>
    );
  }

  return (
    <ol className="relative space-y-4 border-l border-white/10 pl-6">
      {events.map((event, index) => (
        <li key={`${event.toStage}-${event.createdAt}-${index}`} className="relative">
          <span
            className="absolute -left-[1.65rem] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background"
            aria-hidden
          />
          <p className="text-sm font-medium">
            {event.fromStage
              ? t('ecosystemPages.careerApplicationDetail.stageHistory.moved', {
                  params: {
                    from: t(`ecosystemPages.shared.recruitmentStages.${event.fromStage}`),
                    to: t(`ecosystemPages.shared.recruitmentStages.${event.toStage}`),
                  },
                })
              : t('ecosystemPages.careerApplicationDetail.stageHistory.entered', {
                  params: {
                    stage: t(`ecosystemPages.shared.recruitmentStages.${event.toStage}`),
                  },
                })}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(event.createdAt).toLocaleString()}
          </p>
        </li>
      ))}
    </ol>
  );
}

export function stageReachedAt(
  events: StageEvent[],
  stage: string
): number | undefined {
  const match = events.find((event) => event.toStage === stage);
  return match?.createdAt;
}
