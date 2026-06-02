'use client';

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
import { ClientOnly } from '@/lib/hooks/useClientOnly';
import { useLanguage } from '@/lib/context/LanguageContext';
import { api } from '@/convex/_generated/api';

type ContactForm = {
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  role: string;
  feedback: string;
};

const initialForm: ContactForm = {
  fullName: '',
  email: '',
  phone: '',
  organization: '',
  role: '',
  feedback: '',
};

function ContactUsContent() {
  const { t } = useLanguage();
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [submittedMessage, setSubmittedMessage] = useState('');
  const recentSubmissions = useQuery(api.contact.listRecentContactSubmissions, { limit: 3 });
  const submitContactSubmission = useMutation(api.contact.submitContactSubmission);

  const completion = useMemo(() => {
    const fields = [form.fullName, form.email, form.phone, form.organization, form.role, form.feedback];
    const filled = fields.filter((value) => value.trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  }, [form]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitContactSubmission(form);
    setSubmittedMessage(t('contactUsPage.submitSuccess'));
    setForm(initialForm);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ParticleBackground />
      <Header />

      <main className="relative z-10 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8 text-center animate-slide-up">
            <p className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
              {t('contactUsPage.badge')}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('contactUsPage.title')}</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t('contactUsPage.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
            <div className="glass rounded-xl border border-border/50 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t('contactUsPage.responseTime')}</p>
              <p className="text-sm font-semibold">{t('contactUsPage.responseTimeValue')}</p>
            </div>
            <div className="glass rounded-xl border border-border/50 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t('contactUsPage.supportType')}</p>
              <p className="text-sm font-semibold">{t('contactUsPage.supportTypeValue')}</p>
            </div>
            <div className="glass rounded-xl border border-border/50 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t('contactUsPage.preferredContact')}</p>
              <p className="text-sm font-semibold">{t('contactUsPage.preferredContactValue')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <section className="lg:col-span-7 order-2 lg:order-1">
              <form onSubmit={onSubmit} className="glass rounded-xl border border-border/50 p-6 sm:p-8 space-y-6">
                <div className="pb-2 border-b border-border/50">
                  <h2 className="text-2xl font-bold">{t('contactUsPage.formTitle')}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{t('contactUsPage.formDescription')}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('contactUsPage.fullName')}</label>
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={onChange}
                      required
                      className="w-full rounded-lg border border-border/50 bg-muted/40 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder={t('contactUsPage.fullNamePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('contactUsPage.email')}</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={onChange}
                      required
                      className="w-full rounded-lg border border-border/50 bg-muted/40 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder={t('contactUsPage.emailPlaceholder')}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('contactUsPage.phone')}</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      required
                      className="w-full rounded-lg border border-border/50 bg-muted/40 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder={t('contactUsPage.phonePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('contactUsPage.organization')}</label>
                    <input
                      name="organization"
                      value={form.organization}
                      onChange={onChange}
                      className="w-full rounded-lg border border-border/50 bg-muted/40 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder={t('contactUsPage.organizationPlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('contactUsPage.role')}</label>
                  <input
                    name="role"
                    value={form.role}
                    onChange={onChange}
                    className="w-full rounded-lg border border-border/50 bg-muted/40 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t('contactUsPage.rolePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('contactUsPage.feedbackMessage')}</label>
                  <textarea
                    name="feedback"
                    value={form.feedback}
                    onChange={onChange}
                    required
                    rows={7}
                    className="w-full rounded-lg border border-border/50 bg-muted/40 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t('contactUsPage.feedbackPlaceholder')}
                  />
                </div>

                {submittedMessage && (
                  <div className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                    {submittedMessage}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:shadow-glow-cyan transition-all text-sm font-medium"
                  >
                    {t('contactUsPage.submitButton')}
                  </button>
                </div>
              </form>
            </section>

            <aside className="lg:col-span-5 order-1 lg:order-2 space-y-6 lg:sticky lg:top-24 h-fit">
              <section className="glass rounded-xl border border-border/50 p-6">
                <h2 className="text-xl font-bold mb-3">{t('contactUsPage.previewTitle')}</h2>
                <p className="text-sm text-muted-foreground mb-4">{t('contactUsPage.previewDescription')}</p>

                <div className="space-y-3 text-sm">
                  <div className="rounded-lg bg-muted/40 border border-border/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">{t('contactUsPage.fullName')}</p>
                    <p>{form.fullName || t('contactUsPage.notProvidedYet')}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 border border-border/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">{t('contactUsPage.email')}</p>
                    <p>{form.email || t('contactUsPage.notProvidedYet')}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 border border-border/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">{t('contactUsPage.phone')}</p>
                    <p>{form.phone || t('contactUsPage.notProvidedYet')}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 border border-border/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">{t('contactUsPage.organization')}</p>
                    <p>{form.organization || t('contactUsPage.notProvidedYet')}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 border border-border/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">{t('contactUsPage.role')}</p>
                    <p>{form.role || t('contactUsPage.notProvidedYet')}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs text-muted-foreground mb-2">{t('contactUsPage.formCompletion')}</p>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${completion}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{completion}% {t('contactUsPage.completed')}</p>
                </div>
              </section>

              {recentSubmissions && recentSubmissions.length > 0 && (
                <section className="glass rounded-xl border border-border/50 p-6">
                  <h2 className="text-xl font-bold mb-3">{t('contactUsPage.recentSubmissions')}</h2>
                  <div className="space-y-3">
                    {recentSubmissions.map((entry) => (
                      <div key={entry._id} className="rounded-lg border border-border/50 bg-muted/30 p-3">
                        <p className="font-medium text-sm">{entry.fullName}</p>
                        <p className="text-xs text-muted-foreground">{entry.email}</p>
                        <p className="text-xs text-muted-foreground">{entry.phone}</p>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{entry.feedback}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ContactUsPage() {
  return (
    <ClientOnly>
      <ContactUsContent />
    </ClientOnly>
  );
}
