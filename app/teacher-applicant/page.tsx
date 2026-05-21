'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/ParticleBackground';
import { useLanguage } from '@/lib/context/LanguageContext';
import { ClientOnly } from '@/lib/hooks/useClientOnly';

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

function TeacherApplicantContent() {
  const { t } = useLanguage();
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      <Header />

      <main className="relative z-10 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header Section */}
          <div className="mb-12 text-center animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t('teacherApplicant.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('teacherApplicant.description')}
            </p>
          </div>

          {/* Benefits Section */}
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

          {/* Application Form */}
          <div className="glass rounded-xl p-8 border border-border/50 animate-slide-up">
            <h2 className="text-2xl font-bold text-foreground mb-8">{t('teacherApplicant.submitForm')}</h2>

            {submitted && (
              <div className="mb-6 p-4 rounded-lg bg-primary/20 border border-primary/50 text-primary">
                <p className="font-medium">{t('teacherApplicant.successMessage')}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Full Name */}
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
                    placeholder="Your full name"
                  />
                </div>

                {/* Email */}
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
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-muted border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Experience Years */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Years of Teaching Experience *
                  </label>
                  <select
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-muted border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="">Select experience level</option>
                    <option value="0-1">0-1 years</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5+">5+ years</option>
                  </select>
                </div>

                {/* Specialization */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Teaching Specialization *
                  </label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-muted border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="">Select specialization</option>
                    <option value="general">General Korean</option>
                    <option value="business">Business Korean</option>
                    <option value="conversation">Conversation</option>
                    <option value="grammar">Grammar & Writing</option>
                    <option value="culture">Culture & Immersion</option>
                  </select>
                </div>

                {/* Native Language */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Native Language(s) *
                  </label>
                  <input
                    type="text"
                    name="nativeLanguage"
                    value={formData.nativeLanguage}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-muted border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="e.g., English, Spanish"
                  />
                </div>

                {/* Certifications */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Certifications
                  </label>
                  <input
                    type="text"
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-muted border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="e.g., TEFL, TESOL, Korean teaching certificate"
                  />
                </div>

                {/* Hours Available */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Hours Available per Week *
                  </label>
                  <select
                    name="hoursAvailable"
                    value={formData.hoursAvailable}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-muted border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="">Select availability</option>
                    <option value="5-10">5-10 hours</option>
                    <option value="10-20">10-20 hours</option>
                    <option value="20-30">20-30 hours</option>
                    <option value="30+">30+ hours</option>
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tell us about yourself *
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                  placeholder="Share your teaching philosophy, experience with Korean language, and why you want to teach with HDP EDU..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:shadow-glow-cyan transition-all duration-300"
              >
                Submit Application
              </button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              By submitting this form, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TeacherApplicantPage() {
  return (
    <ClientOnly>
      <TeacherApplicantContent />
    </ClientOnly>
  );
}
