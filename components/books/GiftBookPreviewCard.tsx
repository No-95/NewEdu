'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Sparkles } from 'lucide-react';
import { GIFT_BOOK } from '@/lib/books/gift-book';
import { formatVndPrice } from '@/lib/currency';
import { useLanguage } from '@/lib/context/LanguageContext';

export function GiftBookPreviewCard() {
  const { t } = useLanguage();
  const highlights = t('booksPage.giftBook.highlights', { returnObjects: true }) as string[];

  return (
    <div className="overflow-hidden rounded-xl">
      <div className="relative h-36 w-full bg-gradient-to-br from-amber-950/40 to-background">
        <Image
          src={GIFT_BOOK.coverImage}
          alt={t('booksPage.giftBook.coverAlt')}
          fill
          className="object-cover object-center"
          sizes="320px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-amber-100 backdrop-blur-sm">
            <Sparkles className="h-3 w-3" />
            {t('booksPage.giftBook.badge')}
          </span>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-sm font-bold leading-snug text-foreground">{t('booksPage.giftBook.title')}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t('booksPage.giftBook.subtitle')}</p>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">{t('booksPage.giftBook.description')}</p>

        <ul className="space-y-1">
          {highlights.map((item) => (
            <li key={item} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
              <span className="mt-0.5 text-amber-400">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-end justify-between gap-3 rounded-lg border border-amber-300/20 bg-amber-400/5 p-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t('booksPage.giftBook.priceLabel')}</p>
            <p className="text-xs text-muted-foreground line-through">
              {formatVndPrice(GIFT_BOOK.originalPrice)}
            </p>
            <p className="text-base font-bold text-amber-200">{formatVndPrice(GIFT_BOOK.salePrice)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t('booksPage.giftBook.stockLabel')}</p>
            <p className="text-sm font-semibold text-foreground">
              {GIFT_BOOK.stockRemaining} {t('booksPage.giftBook.stockUnit')}
            </p>
            <p className="text-[10px] text-amber-300">{t('booksPage.giftBook.stockStatus')}</p>
          </div>
        </div>

        <Link
          href={GIFT_BOOK.booksPageHref}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-amber-300/30 bg-amber-400/15 px-3 py-2 text-xs font-semibold text-amber-50 transition hover:bg-amber-400/25"
        >
          <BookOpen className="h-3.5 w-3.5" />
          {t('booksPage.giftBook.viewDetails')}
        </Link>
      </div>
    </div>
  );
}
