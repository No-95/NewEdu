'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
import { useLanguage } from '@/lib/context/LanguageContext';

type FormState = {
  fullName: string;
  phone: string;
  address: string;
  note: string;
};

const INITIAL_FORM: FormState = {
  fullName: '',
  phone: '',
  address: '',
  note: '',
};

export default function BooksPurchasePage() {
  const { t } = useLanguage();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!form.fullName.trim() || !form.phone.trim() || !form.address.trim()) {
      setError(t('booksPage.purchase.validationError'));
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/books/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          note: form.note.trim() || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || t('booksPage.purchase.submitError'));
      }

      setSubmitted(true);
      setForm(INITIAL_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('booksPage.purchase.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <Header />
      <ParticleBackground />

      <main className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-16 pt-24 sm:px-8">
        <section className="glass rounded-3xl border border-border/60 p-8 shadow-2xl sm:p-10">
          <p className="inline-flex rounded-full border border-red-700/30 bg-red-700/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-red-300">
            {t('booksPage.purchase.badge')}
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">{t('booksPage.purchase.title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {t('booksPage.purchase.subtitle')}
          </p>

          {submitted ? (
            <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm text-emerald-200">
              {t('booksPage.purchase.success')}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-medium">
                {t('booksPage.purchase.fullName')}
              </label>
              <input
                id="fullName"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder={t('booksPage.purchase.fullNamePlaceholder')}
                autoComplete="name"
                className="w-full rounded-xl border border-border/60 bg-muted/35 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                {t('booksPage.purchase.phone')}
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder={t('booksPage.purchase.phonePlaceholder')}
                autoComplete="tel"
                className="w-full rounded-xl border border-border/60 bg-muted/35 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="address" className="mb-2 block text-sm font-medium">
                {t('booksPage.purchase.address')}
              </label>
              <textarea
                id="address"
                rows={3}
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder={t('booksPage.purchase.addressPlaceholder')}
                autoComplete="street-address"
                className="w-full rounded-xl border border-border/60 bg-muted/35 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="note" className="mb-2 block text-sm font-medium">
                {t('booksPage.purchase.note')}
              </label>
              <textarea
                id="note"
                rows={3}
                value={form.note}
                onChange={(e) => handleChange('note', e.target.value)}
                placeholder={t('booksPage.purchase.notePlaceholder')}
                className="w-full rounded-xl border border-border/60 bg-muted/35 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-6 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? t('booksPage.purchase.submitting') : t('booksPage.purchase.submit')}
              </button>
              <Link
                href="/books"
                className="inline-flex items-center justify-center rounded-xl border border-border/60 bg-card/70 px-6 py-3 text-sm font-semibold text-foreground hover:bg-card"
              >
                {t('booksPage.purchase.backToBooks')}
              </Link>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
