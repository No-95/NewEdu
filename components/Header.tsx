"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage, type Language } from '@/lib/context/LanguageContext';
import { GuestNavMenu } from '@/components/GuestNavMenu';
import { RoleNavMenu } from '@/components/RoleNavMenu';
import { NotificationBell } from '@/components/NotificationBell';

interface HeaderProps {
  onNavigate?: (section: string) => void;
  lockNavigation?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, lockNavigation = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { language, setLanguage, t } = useLanguage();

  React.useEffect(() => {
    setMounted(true);

    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          setActiveRole(data.activeRole ?? null);
          setUserEmail(data.email ?? null);
        } else {
          setIsAuthenticated(false);
          setActiveRole(null);
          setUserEmail(null);
        }
      } catch (e) {
        setIsAuthenticated(false);
        setActiveRole(null);
        setUserEmail(null);
      }
    })();
  }, []);

  React.useEffect(() => {
    const handleRoleChange = (event: Event) => {
      const detail = (event as CustomEvent<{ activeRole: string }>).detail;
      if (detail?.activeRole) {
        setActiveRole(detail.activeRole);
      }
    };

    window.addEventListener('hdp-active-role-changed', handleRoleChange);
    return () => window.removeEventListener('hdp-active-role-changed', handleRoleChange);
  }, []);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-2">
          {/* Logo */}
          {lockNavigation ? (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden">
                <Image src="/hdp-logo.png" alt="HDP EDU logo" width={44} height={44} className="h-full w-full object-cover" priority />
              </div>
              <span className="text-xl font-bold text-foreground">HDP EDU</span>
            </div>
          ) : (
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-11 h-11 rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden">
                <Image src="/hdp-logo.png" alt="HDP EDU logo" width={44} height={44} className="h-full w-full object-cover" priority />
              </div>
              <span className="text-xl font-bold text-foreground">HDP EDU</span>
            </Link>
          )}

          {/* Desktop Navigation */}
          {!lockNavigation && mounted && !isAuthenticated && (
            <div className="pointer-events-none hidden min-w-0 flex-1 justify-center md:flex">
              <GuestNavMenu t={t} variant="desktop" />
            </div>
          )}

          {!lockNavigation && mounted && isAuthenticated && (
            <div className="pointer-events-none hidden min-w-0 flex-1 justify-center md:flex">
              <RoleNavMenu activeRole={activeRole} t={t} variant="desktop" />
            </div>
          )}

          {/* Language Switcher & Auth Buttons */}
          {!lockNavigation && (
          <div className="relative z-20 hidden shrink-0 items-center gap-3 md:flex">
            {/* Language Switcher */}
            {mounted && (
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-all flex items-center gap-1"
              >
                <span className="text-lg">
                  {languages.find(l => l.code === language)?.flag}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              {langMenuOpen && (
                <div className="absolute top-full right-0 mt-2 bg-card border border-border/50 rounded-lg shadow-xl z-50 glass overflow-hidden">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-sm font-medium text-left hover:bg-muted/50 transition-all flex items-center gap-2 ${
                        language === lang.code
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            )}

            {mounted && isAuthenticated && userEmail ? (
              <NotificationBell userEmail={userEmail} />
            ) : null}

            {mounted && (
              isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
                >
                  {t('common.dashboard')}
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth?mode=signin"
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
                  >
                    {t('common.signIn')}
                  </Link>
                  <Link
                    href="/auth?mode=signup"
                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
                  >
                    {t('common.signUp')}
                  </Link>
                </>
              )
            )}
          </div>
          )}

          {/* Mobile Menu Button */}
          {!lockNavigation && (
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          )}
        </div>

        {/* Mobile Menu */}
        {!lockNavigation && mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <nav className="flex flex-col gap-1">
              {mounted && !isAuthenticated && (
                <GuestNavMenu t={t} variant="mobile" onNavigate={() => setMobileMenuOpen(false)} />
              )}

              {mounted && isAuthenticated && (
                <RoleNavMenu
                  activeRole={activeRole}
                  t={t}
                  variant="mobile"
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              )}
              <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                {/* Mobile Language Switcher */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase px-4">Language</p>
                  <div className="flex flex-col gap-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setMobileMenuOpen(false);
                        }}
                        className={`px-4 py-2 text-sm font-medium text-left rounded-lg transition-all flex items-center gap-2 ${
                          language === lang.code
                            ? 'text-primary bg-primary/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Auth Buttons */}
                {mounted && isAuthenticated && userEmail ? (
                  <div className="px-4 py-2">
                    <NotificationBell userEmail={userEmail} />
                  </div>
                ) : null}

                {mounted && (
                <div className="flex gap-2 pt-2">
                  {isAuthenticated ? (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all text-center"
                    >
                      {t('common.dashboard')}
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/auth?mode=signin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg transition-all text-center"
                      >
                        {t('common.signIn')}
                      </Link>
                      <Link
                        href="/auth?mode=signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all text-center"
                      >
                        {t('common.signUp')}
                      </Link>
                    </>
                  )}
                </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
