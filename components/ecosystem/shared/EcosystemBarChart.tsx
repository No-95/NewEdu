'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import type { ChartPoint } from '@/lib/ecosystem/types';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useLanguage } from '@/lib/context/LanguageContext';

export function EcosystemBarChart({
  data,
  title,
  valueSuffix = '',
}: {
  data: ChartPoint[];
  title?: string;
  valueSuffix?: string;
}) {
  const { t } = useLanguage();

  const chartConfig = {
    value: { label: t('ecosystemPages.shared.chartValue'), color: 'hsl(var(--primary))' },
  };

  if (data.length === 0) {
    return (
      <div className="home-card">
        {title && <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>}
        <div className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
          {t('ecosystemPages.shared.emptyChart')}
        </div>
      </div>
    );
  }

  return (
    <div className="home-card">
      {title && <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>}
      <ChartContainer config={chartConfig} className="aspect-[16/9] min-h-[220px] w-full">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} width={40} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => [`${value}${valueSuffix}`, '']}
              />
            }
          />
          <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
