'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Star, Quote, BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import {
  testimonials as defaultTestimonials,
  ratingSummary as defaultSummary,
  type Testimonial,
} from '@/lib/data/testimonials';

interface TestimonialsSectionProps {
  /** Ghi đè dữ liệu mặc định khi cần. */
  items?: Testimonial[];
  /** 'page' = khối lớn cho homepage; 'inline' = gọn cho trang khoá học. */
  variant?: 'page' | 'inline';
  /** Hiển thị thanh điểm tổng hợp phía trên. */
  showSummary?: boolean;
  className?: string;
}

/** Avatar chữ cái đầu với gradient thương hiệu (dùng khi chưa có ảnh thật). */
const LetterAvatar: React.FC<{ name: string; size?: number }> = ({ name, size = 48 }) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full border border-primary/30 bg-gradient-to-br from-primary/25 to-secondary/25 font-bold text-primary"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
};

const Stars: React.FC<{ rating: number; size?: number }> = ({ rating, size = 16 }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={`${rating} trên 5 sao`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={size}
        className={i < Math.round(rating) ? 'text-amber-400' : 'text-muted-foreground/30'}
        fill={i < Math.round(rating) ? 'currentColor' : 'none'}
        strokeWidth={1.5}
      />
    ))}
  </span>
);

const Avatar: React.FC<{ item: Testimonial; size?: number }> = ({ item, size = 48 }) => {
  if (item.avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.avatar}
        alt={item.name}
        width={size}
        height={size}
        className="shrink-0 rounded-full border border-primary/30 object-cover"
        style={{ width: size, height: size }}
        loading="lazy"
      />
    );
  }
  return <LetterAvatar name={item.name} size={size} />;
};

const TestimonialCard: React.FC<{ item: Testimonial; compact?: boolean; verifiedLabel: string }> = ({
  item,
  compact = false,
  verifiedLabel,
}) => (
  <figure
    className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-card/50 backdrop-blur-md transition-all duration-300 hover:border-primary/30 ${
      compact ? 'p-6 md:p-7' : 'p-7 md:p-9'
    }`}
    style={{ boxShadow: '0 24px 60px -42px rgba(0,217,255,0.4)' }}
  >
    {/* Vạch nhấn gradient trên đỉnh thẻ */}
    <span
      className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
      aria-hidden="true"
    />

    {/* Halo trang trí */}
    <span
      className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/10 blur-3xl"
      aria-hidden="true"
    />

    <Quote
      className="absolute right-6 top-6 text-primary/15"
      size={compact ? 38 : 52}
      aria-hidden="true"
    />

    <Stars rating={item.rating} size={compact ? 16 : 18} />

    <blockquote
      className={`relative mt-5 flex-1 italic leading-relaxed text-foreground/90 ${
        compact ? 'text-[15px]' : 'text-base md:text-lg md:leading-relaxed'
      }`}
    >
      &ldquo;{item.quote}&rdquo;
    </blockquote>

    {item.result ? (
      <span className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
        {item.result}
      </span>
    ) : null}

    <figcaption className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
      <Avatar item={item} size={compact ? 44 : 52} />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-bold text-foreground md:text-[15px]">
            {item.name}
          </span>
          {item.verified ? (
            <BadgeCheck
              size={16}
              className="shrink-0 text-primary"
              aria-label={verifiedLabel}
            />
          ) : null}
        </div>
        <p className="truncate text-xs text-muted-foreground md:text-[13px]">
          {item.role}
          {item.company ? ` · ${item.company}` : ''}
        </p>
      </div>
    </figcaption>
  </figure>
);

/** Nút mũi tên dạng kính mờ, viền cyan. */
const ArrowButton: React.FC<{
  direction: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
  label: string;
  size?: number;
}> = ({ direction, disabled, onClick, label, size = 44 }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className={cn(
      'inline-flex shrink-0 items-center justify-center rounded-full border border-primary/30 bg-card/60 text-primary backdrop-blur-md transition-all duration-200',
      'hover:border-primary/60 hover:bg-primary/15 hover:shadow-[0_0_24px_-4px_rgba(0,217,255,0.55)]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
      'disabled:cursor-not-allowed disabled:border-white/10 disabled:text-muted-foreground/40 disabled:shadow-none disabled:hover:bg-card/60',
    )}
    style={{ width: size, height: size }}
  >
    {direction === 'prev' ? (
      <ChevronLeft size={size * 0.48} strokeWidth={2.25} />
    ) : (
      <ChevronRight size={size * 0.48} strokeWidth={2.25} />
    )}
  </button>
);

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  items,
  variant = 'page',
  showSummary = true,
  className = '',
}) => {
  const { t } = useLanguage();
  const data = items && items.length > 0 ? items : defaultTestimonials;
  const summary = defaultSummary;
  const compact = variant === 'inline';

  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [snapCount, setSnapCount] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!api) return;

    const sync = () => {
      setSelected(api.selectedScrollSnap());
      setSnapCount(api.scrollSnapList().length);
      setCanPrev(api.canScrollPrev());
      setCanNext(api.canScrollNext());
    };

    sync();
    api.on('select', sync);
    api.on('reInit', sync);

    return () => {
      api.off('select', sync);
      api.off('reInit', sync);
    };
  }, [api]);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api],
  );

  return (
    <div className={`w-full ${className}`}>
      {!compact ? (
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="home-eyebrow">{t('home.testimonials.eyebrow')}</span>
          <h2 className="home-title mt-4">{t('home.testimonials.title')}</h2>
          <p className="home-subtitle mx-auto mt-3 max-w-2xl">{t('home.testimonials.subtitle')}</p>

          {showSummary ? (
            <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-full border border-white/10 bg-card/50 px-5 py-2.5 backdrop-blur-md">
              <Stars rating={summary.average} size={18} />
              <span className="text-lg font-bold text-foreground">
                {summary.average.toFixed(1)}
                <span className="text-sm font-medium text-muted-foreground">/5</span>
              </span>
              <span className="h-4 w-px bg-white/15" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">
                {summary.total} {t('home.testimonials.reviews')}
              </span>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Stars rating={summary.average} size={18} />
          <span className="text-base font-bold text-foreground">{summary.average.toFixed(1)}/5</span>
          <span className="text-sm text-muted-foreground">
            · {t('home.testimonials.verifiedLearners')}
          </span>
        </div>
      )}

      {/* Vùng carousel: mỗi thẻ là một lượt trượt */}
      <div className="relative" data-testimonials-carousel>
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[80%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl"
          aria-hidden="true"
        />

        <Carousel
          opts={{ align: 'center', containScroll: 'trimSnaps', loop: false }}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent className="-ml-4 items-stretch py-2 md:-ml-5">
            {data.map((item, index) => (
              <CarouselItem
                key={item.id}
                className="basis-[86%] pl-4 md:basis-[70%] md:pl-5 xl:basis-[56%]"
              >
                <div
                  className={cn(
                    'h-full w-full transition-all duration-500',
                    index === selected
                      ? 'scale-100 opacity-100'
                      : 'scale-[0.97] opacity-55 hover:opacity-80',
                  )}
                >
                  <TestimonialCard
                    item={item}
                    compact={compact}
                    verifiedLabel={t('home.testimonials.verifiedBadge')}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Điều khiển: chấm chỉ trang + mũi tên */}
        <div className="mt-7 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2" data-carousel-dots aria-label={t('home.testimonials.title')}>
            {Array.from({ length: snapCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-current={i === selected}
                aria-label={`${t('home.testimonials.slideLabel')} ${i + 1}`}
                onClick={() => scrollTo(i)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                  i === selected
                    ? 'w-8 bg-gradient-to-r from-primary to-secondary shadow-[0_0_12px_-2px_rgba(0,217,255,0.8)]'
                    : 'w-2 bg-white/20 hover:bg-primary/50',
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ArrowButton
              direction="prev"
              disabled={!canPrev}
              onClick={() => api?.scrollPrev()}
              label={t('home.testimonials.prev')}
              size={compact ? 40 : 44}
            />
            <ArrowButton
              direction="next"
              disabled={!canNext}
              onClick={() => api?.scrollNext()}
              label={t('home.testimonials.next')}
              size={compact ? 40 : 44}
            />
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground/80">
        {t('home.testimonials.disclaimer')}
      </p>
    </div>
  );
};
