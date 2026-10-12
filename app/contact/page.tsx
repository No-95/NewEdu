'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
import { ClientOnly } from '@/lib/hooks/useClientOnly';
import { trackGenerateLead } from '@/components/GA4Tracker';

function ContactContent() {
  const { t, language } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const c = t('contactUsPage');
  const faqs = t('contactFaqs', { returnObjects: true }) as
    | { q: string; a: string }[]
    | undefined;

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gửi thất bại');
      trackGenerateLead('contact_form', { form_name: 'contact' });
      setStatus('ok');
      setForm({ name: '', email: '', message: '' });
    } catch (err: unknown) {
      setStatus('err');
      setErrMsg(err instanceof Error ? err.message : 'Lỗi');
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ParticleBackground />
      <Header />
      <main className="relative z-10 mx-auto max-w-2xl px-6 pb-20 pt-28">
        <div className="home-card space-y-8">
          <div>
            <span className="inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              {c.badge}
            </span>
            <h1 className="mt-4 text-4xl font-bold">{c.title}</h1>
            <p className="mt-3 text-sm text-muted-foreground">{c.description}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-sm text-muted-foreground">
            <div>{c.responseTime}: {c.responseTimeValue}</div>
            <div>{c.supportType}: {c.supportTypeValue}</div>
            <div>{c.preferredContact}: {c.preferredContactValue}</div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                {c.fullName} <span className="text-red-400">*</span>
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder={c.fullNamePlaceholder}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                {c.email} <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder={c.emailPlaceholder}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                {c.feedbackMessage} <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                placeholder={c.feedbackPlaceholder}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            {status === 'ok' && (
              <p className="text-sm text-green-400">{c.submitSuccess}</p>
            )}
            {status === 'err' && (
              <p className="text-sm text-red-400">{errMsg}</p>
            )}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-60"
            >
              {status === 'loading' ? 'Đang gửi...' : c.submitButton}
            </button>
          </form>

          {/* FAQ dropdown */}
          {Array.isArray(faqs) && faqs.length > 0 && (
            <div className="space-y-3 pt-6">
              <h2 className="text-lg font-semibold text-foreground">Câu hỏi thường gặp</h2>
              {faqs.map((faq, i) => (
                <div key={i} className="home-card !p-0 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground hover:text-primary"
                  >
                    {faq.q}
                    <span className="ml-2 text-lg leading-none">
                      {openFaq === i ? '−' : '+'}
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ContactPage() {
  return (
    <ClientOnly>
      <ContactContent />
    </ClientOnly>
  );
}