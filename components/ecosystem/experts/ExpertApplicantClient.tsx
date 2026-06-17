'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
import { useLanguage } from '@/lib/context/LanguageContext';
import { api } from '@/convex/_generated/api';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  bio: string;
}

export function ExpertApplicantClient() {
  const { t } = useLanguage();
  const [formEmail, setFormEmail] = useState('');
  const myApplication = useQuery(
    api.experts.getMyExpertApplication,
    formEmail ? { email: formEmail } : 'skip'
  );
  const submitExpertApplication = useMutation(api.experts.submitExpertApplication);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    specialization: '',
    bio: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    let mounted = true;
    void fetch('/api/auth/me', { credentials: 'same-origin', cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted || !data?.email || prefilled) return;
        setFormEmail(data.email);
        setFormData((prev) => ({
          ...prev,
          fullName: data.fullName?.trim() || prev.fullName,
          email: data.email,
        }));
        setPrefilled(true);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [prefilled]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'email') {
      setFormEmail(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitExpertApplication(formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const statusBannerClass =
    myApplication?.status === 'accepted'
      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
      : myApplication?.status === 'rejected'
        ? 'border-red-500/40 bg-red-500/10 text-red-300'
        : 'border-primary/40 bg-primary/10 text-primary';

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      <Header />

      <main className="relative z-10 pb-16 pt-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-10 text-center">
            <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              {t('expertApplicant.title')}
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              {t('expertApplicant.description')}
            </p>
          </div>

          {myApplication ? (
            <div className={`mb-8 rounded-xl border p-4 ${statusBannerClass}`}>
              <p className="font-semibold">{t('expertApplicant.yourApplication')}</p>
              <p className="mt-1 text-sm">
                {t(`expertApplicant.applicationStatus.${myApplication.status}`)} ·{' '}
                {myApplication.specialization}
              </p>
              {myApplication.status === 'accepted' ? (
                <Link href="/dashboard" className="mt-3 inline-block text-sm font-semibold underline">
                  {t('common.dashboard')}
                </Link>
              ) : null}
            </div>
          ) : null}

          <div className="glass rounded-xl border border-border/50 p-8">
            <h2 className="mb-8 text-2xl font-bold text-foreground">{t('expertApplicant.submitForm')}</h2>

            {submitted ? (
              <div className="mb-6 rounded-lg border border-primary/50 bg-primary/20 p-4 text-primary">
                <p className="font-medium">{t('expertApplicant.successMessage')}</p>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    {t('expertApplicant.fullName')} *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border/50 bg-muted px-4 py-3 text-foreground placeholder-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t('expertApplicant.placeholders.fullName')}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    {t('expertApplicant.email')} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border/50 bg-muted px-4 py-3 text-foreground placeholder-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t('expertApplicant.placeholders.email')}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    {t('expertApplicant.phone')} *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border/50 bg-muted px-4 py-3 text-foreground placeholder-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t('expertApplicant.placeholders.phone')}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    {t('expertApplicant.specialization')} *
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border/50 bg-muted px-4 py-3 text-foreground placeholder-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t('expertApplicant.placeholders.specialization')}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  {t('expertApplicant.bio')} *
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full resize-none rounded-lg border border-border/50 bg-muted px-4 py-3 text-foreground placeholder-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={t('expertApplicant.placeholders.bio')}
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all duration-300 hover:shadow-glow-cyan"
              >
                {t('expertApplicant.submitForm')}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">{t('expertApplicant.termsNotice')}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
