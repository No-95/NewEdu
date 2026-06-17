'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
import { useLanguage } from '@/lib/context/LanguageContext';
import { ClientOnly } from '@/lib/hooks/useClientOnly';
import { api } from '@/convex/_generated/api';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  experienceYears: string;
  specialization: string;
  certifications: string;
  nativeLanguage: string;
  hoursAvailable: string;
  bio: string;
}

export function TeacherApplicantClient() {
  const { t } = useLanguage();
  const [formEmail, setFormEmail] = useState('');
  const recentApplications = useQuery(api.teacherApplications.listRecentTeacherApplications, { limit: 3 });
  const myApplication = useQuery(
    api.teacherApplications.getMyTeacherApplication,
    formEmail ? { email: formEmail } : 'skip'
  );
  const submitTeacherApplication = useMutation(api.teacherApplications.submitTeacherApplication);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    experienceYears: '',
    specialization: '',
    certifications: '',
    nativeLanguage: '',
    hoursAvailable: '',
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === 'email') {
      setFormEmail(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitTeacherApplication(formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const benefits = [
    {
      icon: '💰',
      title: t('teacherApplicant.benefits.compensation'),
      description: t('teacherApplicant.benefits.compensationDesc'),
    },
    {
      icon: '🌍',
      title: t('teacherApplicant.benefits.globalReach'),
      description: t('teacherApplicant.benefits.globalReachDesc'),
    },
    {
      icon: '⏰',
      title: t('teacherApplicant.benefits.flexibleSchedule'),
      description: t('teacherApplicant.benefits.flexibleScheduleDesc'),
    },
    {
      icon: '📈',
      title: t('teacherApplicant.benefits.professionalGrowth'),
      description: t('teacherApplicant.benefits.professionalGrowthDesc'),
    },
    {
      icon: '🤝',
      title: t('teacherApplicant.benefits.communitySupport'),
      description: t('teacherApplicant.benefits.communitySupportDesc'),
    },
    {
      icon: '🎓',
      title: t('teacherApplicant.benefits.resources'),
      description: t('teacherApplicant.benefits.resourcesDesc'),
    },
  ];

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

      <main className="relative z-10 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-12 text-center animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t('teacherApplicant.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('teacherApplicant.description')}
            </p>
          </div>

          {myApplication ? (
            <div className={`mb-8 rounded-xl border p-4 ${statusBannerClass}`}>
              <p className="font-semibold">{t('teacherApplicant.yourApplication')}</p>
              <p className="mt-1 text-sm">
                {t(`teacherApplicant.applicationStatus.${myApplication.status}`)} ·{' '}
                {myApplication.specialization}
              </p>
              {myApplication.status === 'accepted' ? (
                <Link href="/dashboard" className="mt-3 inline-block text-sm font-semibold underline">
                  {t('common.dashboard')}
                </Link>
              ) : null}
            </div>
          ) : null}

          <div className="grid md:grid-cols-3 gap-6 mb-16 animate-fade-in">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="glass rounded-xl p-6 hover:shadow-glow-cyan transition-all duration-300 border border-border/50 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl mb-3">{benefit.icon}</div>
                <h3 className="text-lg font-bold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="glass rounded-xl p-8 border border-border/50 animate-slide-up">
            <h2 className="text-2xl font-bold text-foreground mb-8">{t('teacherApplicant.submitForm')}</h2>

            {submitted && (
              <div className="mb-6 p-4 rounded-lg bg-primary/20 border border-primary/50 text-primary">
                <p className="font-medium">{t('teacherApplicant.successMessage')}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('teacherApplicant.fullName')} *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-muted border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder={t('teacherApplicant.placeholders.fullName')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('teacherApplicant.email')} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-muted border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder={t('teacherApplicant.placeholders.email')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('teacherApplicant.phone')} *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-muted border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder={t('teacherApplicant.placeholders.phone')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('teacherApplicant.experienceYears')} *
                  </label>
                  <select
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-muted border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="">{t('teacherApplicant.options.experiencePlaceholder')}</option>
                    <option value="0-1">{t('teacherApplicant.options.experience0to1')}</option>
                    <option value="1-3">{t('teacherApplicant.options.experience1to3')}</option>
                    <option value="3-5">{t('teacherApplicant.options.experience3to5')}</option>
                    <option value="5+">{t('teacherApplicant.options.experience5plus')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('teacherApplicant.specialization')} *
                  </label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-muted border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="">{t('teacherApplicant.options.specializationPlaceholder')}</option>
                    <option value="general">{t('teacherApplicant.options.specializationGeneral')}</option>
                    <option value="business">{t('teacherApplicant.options.specializationBusiness')}</option>
                    <option value="conversation">{t('teacherApplicant.options.specializationConversation')}</option>
                    <option value="grammar">{t('teacherApplicant.options.specializationGrammar')}</option>
                    <option value="culture">{t('teacherApplicant.options.specializationCulture')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('teacherApplicant.nativeLanguage')} *
                  </label>
                  <input
                    type="text"
                    name="nativeLanguage"
                    value={formData.nativeLanguage}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-muted border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder={t('teacherApplicant.placeholders.nativeLanguage')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('teacherApplicant.certifications')}
                  </label>
                  <input
                    type="text"
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-muted border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder={t('teacherApplicant.placeholders.certifications')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('teacherApplicant.hoursAvailable')} *
                  </label>
                  <select
                    name="hoursAvailable"
                    value={formData.hoursAvailable}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-muted border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="">{t('teacherApplicant.options.hoursPlaceholder')}</option>
                    <option value="5-10">{t('teacherApplicant.options.hours5to10')}</option>
                    <option value="10-20">{t('teacherApplicant.options.hours10to20')}</option>
                    <option value="20-30">{t('teacherApplicant.options.hours20to30')}</option>
                    <option value="30+">{t('teacherApplicant.options.hours30plus')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('teacherApplicant.bio')} *
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                  placeholder={t('teacherApplicant.placeholders.bio')}
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:shadow-glow-cyan transition-all duration-300"
              >
                {t('teacherApplicant.submitForm')}
              </button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              {t('teacherApplicant.termsNotice')}
            </p>
          </div>

          {recentApplications && recentApplications.length > 0 && (
            <div className="mt-8 glass rounded-xl p-6 border border-border/50">
              <h2 className="text-xl font-bold mb-3">{t('teacherApplicant.recentApplications')}</h2>
              <div className="space-y-3">
                {recentApplications.map((application) => (
                  <div key={application._id} className="rounded-lg border border-border/50 bg-muted/30 p-3 text-sm">
                    <p className="font-medium">{application.fullName}</p>
                    <p className="text-muted-foreground">{application.specialization}</p>
                    <p className="text-xs text-muted-foreground capitalize">{application.status}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
