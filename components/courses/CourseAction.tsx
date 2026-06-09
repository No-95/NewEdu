'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatVndPrice } from '@/lib/currency';
import { useLanguage } from '@/lib/context/LanguageContext';
import { COURSE_TEXT, getCourseLanguage } from '@/lib/courses/localization';

type CourseActionProps = {
  courseSlug: string;
  isFree: boolean;
  price: number;
  hideContinueButton?: boolean;
};

type GiftFormState = {
  fullName: string;
  phone: string;
  address: string;
  note: string;
};

const INITIAL_GIFT_FORM: GiftFormState = {
  fullName: '',
  phone: '',
  address: '',
  note: '',
};

const actionWidthClass = 'w-full';
const actionBtnClass =
  'flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold';
const giftBadgeClass =
  'flex w-full items-center justify-center rounded-full border border-amber-300/50 px-4 py-2 text-sm font-semibold';

export default function CourseAction({
  courseSlug,
  isFree,
  price,
  hideContinueButton = false,
}: CourseActionProps) {
  const { language } = useLanguage();
  const text = COURSE_TEXT[getCourseLanguage(language)].action;
  const [user, setUser] = useState<{ _id?: string; email?: string } | null>(null);
  const [creating, setCreating] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [giftClaimed, setGiftClaimed] = useState(false);
  const [giftDialogOpen, setGiftDialogOpen] = useState(false);
  const [giftForm, setGiftForm] = useState<GiftFormState>(INITIAL_GIFT_FORM);
  const [giftError, setGiftError] = useState('');
  const [giftSuccess, setGiftSuccess] = useState(false);
  const [giftSubmitting, setGiftSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const res = await fetch('/api/profile/me', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setUser(data);

        if (data) {
          const accessRes = await fetch(
            `/api/purchase/has-access?courseId=${encodeURIComponent(courseSlug)}`,
            { cache: 'no-store' },
          );
          if (accessRes.ok) {
            const json = await accessRes.json();
            if (mounted) setHasAccess(!!json.hasAccess);
          }

          if (mounted && !isFree) {
            const giftRes = await fetch(
              `/api/books/course-gift?courseId=${encodeURIComponent(courseSlug)}`,
              { cache: 'no-store' },
            );
            if (giftRes.ok) {
              const giftJson = await giftRes.json();
              if (mounted) setGiftClaimed(!!giftJson.claimed);
            }
          }
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [courseSlug, isFree]);

  const handlePurchase = async () => {
    if (!user) {
      alert(text.signInToPurchase);
      return;
    }

    setCreating(true);
    try {
      const createRes = await fetch('/api/purchase/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: courseSlug, provider: 'payos', amount: price, currency: 'VND' }),
      });
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error(err.error || text.createPurchaseFailed);
      }
      const createJson = await createRes.json();
      const purchaseId = createJson.purchaseId;

      const payosRes = await fetch('/api/purchase/payos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId }),
      });
      if (!payosRes.ok) {
        const err = await payosRes.json().catch(() => ({}));
        throw new Error(err.error || text.payosFailed);
      }
      const payosJson = await payosRes.json();
      const payUrl = payosJson.payUrl;

      if (!payUrl) throw new Error(text.purchaseFailed);

      if (payUrl.startsWith('/api/purchase/notify')) {
        await fetch(payUrl);
        window.location.href = `/courses/${courseSlug}?paid=1`;
        return;
      }

      window.location.href = payUrl;
    } catch (err) {
      console.error('Purchase error', err);
      alert(err instanceof Error ? err.message : text.purchaseFailed);
    } finally {
      setCreating(false);
    }
  };

  const handleGiftOpen = () => {
    if (giftClaimed) return;
    if (!user) {
      alert(text.signInToClaim);
      return;
    }
    if (!hasAccess) {
      alert(text.signInToPurchase);
      return;
    }
    setGiftError('');
    setGiftSuccess(false);
    setGiftDialogOpen(true);
  };

  const handleGiftSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (giftClaimed || giftSubmitting) return;
    setGiftError('');

    if (!giftForm.fullName.trim() || !giftForm.phone.trim() || !giftForm.address.trim()) {
      setGiftError('Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ giao hàng.');
      return;
    }

    try {
      setGiftSubmitting(true);
      const response = await fetch('/api/books/course-gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: courseSlug,
          fullName: giftForm.fullName.trim(),
          phone: giftForm.phone.trim(),
          address: giftForm.address.trim(),
          note: giftForm.note.trim() || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 409) {
          setGiftClaimed(true);
          setGiftDialogOpen(false);
        }
        throw new Error(data.error || 'Gửi đơn thất bại.');
      }

      setGiftSuccess(true);
      setGiftClaimed(true);
      setGiftForm(INITIAL_GIFT_FORM);
      setGiftDialogOpen(false);
    } catch (err) {
      setGiftError(err instanceof Error ? err.message : 'Gửi đơn thất bại.');
    } finally {
      setGiftSubmitting(false);
    }
  };

  const renderGiftBadge = () => {
    if (isFree) return null;

    if (hasAccess) {
      if (giftClaimed) {
        return (
          <span
            className={`${giftBadgeClass} cursor-default bg-amber-400/20 text-amber-100`}
          >
            {text.alreadyClaimedGift}
          </span>
        );
      }

      return (
        <button
          type="button"
          onClick={handleGiftOpen}
          disabled={giftSubmitting}
          className={`${giftBadgeClass} bg-amber-400/25 text-amber-50 transition hover:bg-amber-400/40 disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {text.claimFreeBook}
        </button>
      );
    }

    return (
      <span
        className={`${giftBadgeClass} cursor-default select-none bg-amber-400/20 text-amber-100`}
        aria-hidden
      >
        {text.giftBookBadge}
      </span>
    );
  };

  if (isFree) {
    return (
      <div className="mt-6 inline-flex items-center">
        <Link
          href={`/courses/${courseSlug}`}
          className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
        >
          {text.startCourse}
        </Link>
      </div>
    );
  }

  const giftDialog = (
    <Dialog open={giftDialogOpen} onOpenChange={setGiftDialogOpen}>
        <DialogContent className="max-w-md border-border/60 bg-card">
          <DialogHeader>
            <DialogTitle>{text.giftFormTitle}</DialogTitle>
            <DialogDescription>{text.giftFormDescription}</DialogDescription>
          </DialogHeader>
          {giftSuccess ? (
            <p className="text-sm text-emerald-300">{text.giftSuccess}</p>
          ) : (
            <form onSubmit={handleGiftSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">{text.giftFullName}</label>
                <input
                  value={giftForm.fullName}
                  onChange={(e) => setGiftForm((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder={text.giftFullNamePlaceholder}
                  className="w-full rounded-lg border border-border/60 bg-muted/35 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{text.giftPhone}</label>
                <input
                  type="tel"
                  value={giftForm.phone}
                  onChange={(e) => setGiftForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder={text.giftPhonePlaceholder}
                  className="w-full rounded-lg border border-border/60 bg-muted/35 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{text.giftAddress}</label>
                <textarea
                  rows={3}
                  value={giftForm.address}
                  onChange={(e) => setGiftForm((p) => ({ ...p, address: e.target.value }))}
                  placeholder={text.giftAddressPlaceholder}
                  className="w-full rounded-lg border border-border/60 bg-muted/35 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{text.giftNote}</label>
                <textarea
                  rows={2}
                  value={giftForm.note}
                  onChange={(e) => setGiftForm((p) => ({ ...p, note: e.target.value }))}
                  placeholder={text.giftNotePlaceholder}
                  className="w-full rounded-lg border border-border/60 bg-muted/35 px-3 py-2 text-sm"
                />
              </div>
              {giftError ? <p className="text-sm text-red-400">{giftError}</p> : null}
              <Button type="submit" disabled={giftSubmitting} className="w-full">
                {giftSubmitting ? text.giftSubmitting : text.giftSubmit}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
  );

  if (hasAccess && hideContinueButton) {
    return (
      <div className={`mt-6 flex flex-col gap-2 ${actionWidthClass}`}>
        {renderGiftBadge()}
        {giftDialog}
      </div>
    );
  }

  return (
    <div className={`mt-6 flex flex-col gap-2 ${actionWidthClass}`}>
      {renderGiftBadge()}

      {hasAccess ? (
        <Link
          href={`/courses/${courseSlug}`}
          className={`${actionBtnClass} bg-zinc-800 text-white`}
        >
          {text.continueCourse}
        </Link>
      ) : (
        <>
          <p className="w-full text-center text-sm font-semibold text-foreground">
            {formatVndPrice(price)}
          </p>
          <Button
            onClick={handlePurchase}
            disabled={creating}
            className={`${actionBtnClass} h-auto bg-primary text-primary-foreground`}
          >
            {creating ? text.processing : text.purchaseCourse}
          </Button>
        </>
      )}

      {giftDialog}
    </div>
  );
}
