'use client';

import React, { useState } from 'react';
import { useAction, useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/ParticleBackground';
import { useLanguage } from '@/lib/context/LanguageContext';
import { api } from '@/convex/_generated/api';

async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function AuthPageContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: '',
    agreeToTerms: false,
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const isSuccessMessage =
    otpVerified ||
    otpMessage.startsWith('Welcome back') ||
    otpMessage.startsWith('Account created successfully') ||
    otpMessage.startsWith('OTP was sent to your email') ||
    otpMessage.startsWith('OTP verified successfully');
  const userRecord = useQuery(api.auth.getUserByEmail, { email: formData.email || '' });
  const sendOtp = useAction(api.auth.sendOtp);
  const verifyOtp = useMutation(api.auth.verifyOtp);
  const createOrUpdateUser = useMutation(api.auth.createOrUpdateUser);

  const establishSession = async (email: string) => {
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      let message = 'Failed to create session.';
      try {
        const body = await response.json();
        if (body?.error) {
          message = body.error;
        }
      } catch {
        // Ignore parsing error and use fallback message.
      }
      throw new Error(message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (name === 'email' && !isSignIn) {
      setOtpSent(false);
      setOtpVerified(false);
      setOtpMessage('');
      setFormData((prev) => ({
        ...prev,
        otp: '',
      }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      setOtpMessage('Please enter your email first.');
      return;
    }

    setOtpLoading(true);
    setOtpMessage('');

    try {
      const result = await sendOtp({ email: formData.email });
      const fallbackOtp = result.message.match(/\b(\d{6})\b/)?.[1];

      setOtpSent(true);
      setOtpVerified(false);
      if (fallbackOtp) {
        setFormData((prev) => ({
          ...prev,
          otp: fallbackOtp,
        }));
      }
      setOtpMessage(result.message || 'OTP was sent to your email.');
    } catch {
      setOtpMessage('Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp) {
      setOtpMessage('Please enter the OTP.');
      return;
    }

    setOtpLoading(true);
    setOtpMessage('');

    try {
      await verifyOtp({ email: formData.email, otp: formData.otp });

      setOtpVerified(true);
      setOtpMessage('OTP verified successfully.');
    } catch (error) {
      setOtpVerified(false);
      if (error instanceof Error) {
        setOtpMessage(error.message);
      } else {
        setOtpMessage('OTP verification failed. Please try again.');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!isSignIn) {
        if (formData.password !== formData.confirmPassword) {
          setOtpMessage('Password and Confirm Password do not match.');
          return;
        }

        if (!otpVerified) {
          setOtpMessage('Please verify OTP before creating your account.');
          return;
        }

        const passwordHash = await hashPassword(formData.password);
        await createOrUpdateUser({
          email: formData.email,
          fullName: formData.fullName,
          phone: formData.phone,
          passwordHash,
          agreeToTerms: formData.agreeToTerms,
        });

        await establishSession(formData.email);
        setOtpMessage('Account created successfully. Redirecting...');
        router.push('/courses');
        router.refresh();
        return;
      }

      if (!userRecord) {
        setOtpMessage('No account found for this email.');
        return;
      }

      const passwordHash = await hashPassword(formData.password);
      if (!userRecord.passwordHash) {
        setOtpMessage('This account has no password set. Please sign up again.');
        return;
      }
      if (userRecord.passwordHash !== passwordHash) {
        setOtpMessage('Incorrect password.');
        return;
      }

      await establishSession(formData.email);
      setOtpMessage(`Welcome back, ${userRecord.fullName}. Redirecting...`);
      router.push('/courses');
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        setOtpMessage(error.message);
        return;
      }
      setOtpMessage('Authentication failed. Please try again.');
    }
  };

  const toggleAuthMode = () => {
    setIsSignIn((prev) => !prev);
    setOtpSent(false);
    setOtpVerified(false);
    setOtpLoading(false);
    setOtpMessage('');
    setFormData((prev) => ({
      ...prev,
      otp: '',
    }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <ParticleBackground />
      <Header />

      <div className="relative z-10 w-full max-w-md mx-auto px-6 py-8 mt-16">
        <div className="glass rounded-xl p-8 border border-border/50 animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isSignIn ? t('auth.welcomeBack') : t('auth.joinHdpEdu')}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isSignIn
                ? t('auth.signInDesc')
                : t('auth.signUpDesc')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Sign Up Only) */}
            {!isSignIn && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Họ và Tên
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="John Doe"
                  required={!isSignIn}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('auth.email')}
              </label>
              <div className={!isSignIn ? 'flex gap-2' : ''}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="you@example.com"
                  required
                />
                {!isSignIn && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading}
                    className="shrink-0 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    {otpLoading ? 'Sending...' : 'Receive OTP'}
                  </button>
                )}
              </div>
            </div>

            {/* Phone (Sign Up Only) */}
            {!isSignIn && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Số Điện Thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="090..."
                  required={!isSignIn}
                />
              </div>
            )}

            {/* OTP (Sign Up Only, shown after Receive OTP) */}
            {!isSignIn && otpSent && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">OTP</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    maxLength={6}
                    className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Enter 6-digit OTP"
                    required={!isSignIn}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpLoading}
                    className="shrink-0 px-4 py-2.5 rounded-lg border border-primary/50 text-primary text-sm font-semibold hover:bg-primary/10 disabled:opacity-50"
                  >
                    Verify
                  </button>
                </div>
              </div>
            )}

            {otpMessage && (
              <p className={`text-xs ${isSuccessMessage ? 'text-emerald-400' : 'text-amber-300'}`}>
                {otpMessage}
              </p>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('auth.password')}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Confirm Password (Sign Up Only) */}
            {!isSignIn && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('auth.confirmPassword')}
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="••••••••"
                  required={!isSignIn}
                />
              </div>
            )}

            {/* Forgot Password (Sign In Only) */}
            {isSignIn && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded bg-muted border border-border/50 cursor-pointer accent-primary"
                  />
                  <span className="text-sm text-muted-foreground">{t('auth.rememberMe')}</span>
                </label>
                <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
                  {t('auth.forgotPassword')}
                </a>
              </div>
            )}

            {/* Terms & Conditions (Sign Up Only) */}
            {!isSignIn && (
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="w-4 h-4 rounded bg-muted border border-border/50 cursor-pointer accent-primary mt-0.5"
                  required
                />
                <span className="text-xs text-muted-foreground">
                  {t('auth.agreeToTerms')}{' '}
                  <a href="#" className="text-primary hover:underline">
                    {t('auth.termsOfService')}
                  </a>{' '}
                  {t('auth.agreeToTerms').split(' ').slice(0,1)} {' '}
                  <a href="#" className="text-primary hover:underline">
                    {t('auth.privacyPolicy')}
                  </a>
                </span>
              </label>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isSignIn && !otpVerified}
              className="w-full px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:shadow-glow-cyan transition-all duration-300 mt-6"
            >
              {isSignIn ? t('common.signIn') : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">{t('auth.orContinueWith')}</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="px-4 py-2.5 rounded-lg bg-muted border border-border/50 text-foreground hover:bg-muted/80 transition-all text-sm font-medium flex items-center justify-center gap-2">
              <span>Google</span>
            </button>
            <button className="px-4 py-2.5 rounded-lg bg-muted border border-border/50 text-foreground hover:bg-muted/80 transition-all text-sm font-medium flex items-center justify-center gap-2">
              <span>GitHub</span>
            </button>
          </div>

          {/* Toggle Sign In / Sign Up */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isSignIn ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
              <button
                onClick={toggleAuthMode}
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                {isSignIn ? t('common.signUp') : t('common.signIn')}
              </button>
            </p>
          </div>

          {/* Features (Sign Up Only) */}
          {!isSignIn && (
            <div className="mt-8 pt-6 border-t border-border/50 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {t('auth.whatYouGet')}
              </p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span>{t('auth.accessCourses')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span>{t('auth.communityDiscussions')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span>{t('auth.progressTracking')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <AuthPageContent />;
}
