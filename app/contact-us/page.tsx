'use client';

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/ParticleBackground';
import { ClientOnly } from '@/lib/hooks/useClientOnly';
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
    setSubmittedMessage('Thanks. Your information and feedback have been submitted.');
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
              Support & Feedback
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Send your information and feedback. Our team will review your message and get back to you quickly.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
            <div className="glass rounded-xl border border-border/50 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Response Time</p>
              <p className="text-sm font-semibold">Within 24 hours</p>
            </div>
            <div className="glass rounded-xl border border-border/50 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Support Type</p>
              <p className="text-sm font-semibold">Job, Course, Platform</p>
            </div>
            <div className="glass rounded-xl border border-border/50 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Preferred Contact</p>
              <p className="text-sm font-semibold">Email / Phone</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <section className="lg:col-span-7 order-2 lg:order-1">
              <form onSubmit={onSubmit} className="glass rounded-xl border border-border/50 p-6 sm:p-8 space-y-6">
                <div className="pb-2 border-b border-border/50">
                  <h2 className="text-2xl font-bold">Send Your Information</h2>
                  <p className="text-sm text-muted-foreground mt-1">Please fill in your details and feedback message below.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={onChange}
                      required
                      className="w-full rounded-lg border border-border/50 bg-muted/40 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Nguyen Van A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={onChange}
                      required
                      className="w-full rounded-lg border border-border/50 bg-muted/40 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      required
                      className="w-full rounded-lg border border-border/50 bg-muted/40 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="090..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Organization</label>
                    <input
                      name="organization"
                      value={form.organization}
                      onChange={onChange}
                      className="w-full rounded-lg border border-border/50 bg-muted/40 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="HDP EDU"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Your Role</label>
                  <input
                    name="role"
                    value={form.role}
                    onChange={onChange}
                    className="w-full rounded-lg border border-border/50 bg-muted/40 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Teacher / Student / Partner"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Feedback Message</label>
                  <textarea
                    name="feedback"
                    value={form.feedback}
                    onChange={onChange}
                    required
                    rows={7}
                    className="w-full rounded-lg border border-border/50 bg-muted/40 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Share your feedback, request, or question..."
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
                    Submit Information
                  </button>
                </div>
              </form>
            </section>

            <aside className="lg:col-span-5 order-1 lg:order-2 space-y-6 lg:sticky lg:top-24 h-fit">
              <section className="glass rounded-xl border border-border/50 p-6">
                <h2 className="text-xl font-bold mb-3">Your Information</h2>
                <p className="text-sm text-muted-foreground mb-4">Live preview based on what you type in the form.</p>

                <div className="space-y-3 text-sm">
                  <div className="rounded-lg bg-muted/40 border border-border/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Full Name</p>
                    <p>{form.fullName || 'Not provided yet'}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 border border-border/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p>{form.email || 'Not provided yet'}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 border border-border/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Phone</p>
                    <p>{form.phone || 'Not provided yet'}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 border border-border/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Organization</p>
                    <p>{form.organization || 'Not provided yet'}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 border border-border/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Role</p>
                    <p>{form.role || 'Not provided yet'}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs text-muted-foreground mb-2">Form completion</p>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${completion}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{completion}% completed</p>
                </div>
              </section>

              {recentSubmissions && recentSubmissions.length > 0 && (
                <section className="glass rounded-xl border border-border/50 p-6">
                  <h2 className="text-xl font-bold mb-3">Recent Submissions</h2>
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
