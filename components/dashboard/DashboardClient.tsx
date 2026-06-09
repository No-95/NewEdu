'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
import { RoleSwitcher } from '@/components/dashboard/RoleSwitcher';
import { LearnerDashboard } from '@/components/dashboard/roles/LearnerDashboard';
import { TeacherDashboard } from '@/components/dashboard/roles/TeacherDashboard';
import { JobSeekerDashboard } from '@/components/dashboard/roles/JobSeekerDashboard';
import { EmployerDashboard } from '@/components/dashboard/roles/EmployerDashboard';
import { ExpertDashboard } from '@/components/dashboard/roles/ExpertDashboard';
import { useLanguage } from '@/lib/context/LanguageContext';
import { getRoleLabelKey } from '@/lib/dashboard/role-utils';
import { resolveRoleNavKey } from '@/lib/navigation/role-nav';

type SessionUser = {
  fullName: string | null;
  email: string | null;
  activeRole: string | null;
  roles: string[];
};

function RoleDashboardBody({
  activeRole,
  fullName,
}: {
  activeRole: string | null;
  fullName: string | null;
}) {
  const navKey = resolveRoleNavKey(activeRole);

  switch (navKey) {
    case 'teacher':
      return <TeacherDashboard />;
    case 'job_seeker':
      return <JobSeekerDashboard />;
    case 'employer':
      return <EmployerDashboard />;
    case 'expert':
      return <ExpertDashboard />;
    case 'learner':
    default:
      return <LearnerDashboard fullName={fullName ?? ''} />;
  }
}

export function DashboardClient() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);

  const loadUser = async () => {
    const response = await fetch('/api/auth/me', { credentials: 'same-origin', cache: 'no-store' });
    if (response.status === 401) {
      router.replace('/auth');
      return;
    }
    if (!response.ok) {
      setLoading(false);
      return;
    }
    const data = await response.json();
    setUser({
      fullName: data.fullName ?? null,
      email: data.email ?? null,
      activeRole: data.activeRole ?? null,
      roles: Array.isArray(data.roles) ? data.roles : [],
    });
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, [router]);

  useEffect(() => {
    const handleRoleChange = (event: Event) => {
      const detail = (event as CustomEvent<{ activeRole: string }>).detail;
      if (detail?.activeRole) {
        setUser((prev) => (prev ? { ...prev, activeRole: detail.activeRole } : prev));
        setLoading(false);
      }
    };

    window.addEventListener('hdp-active-role-changed', handleRoleChange);
    return () => window.removeEventListener('hdp-active-role-changed', handleRoleChange);
  }, []);

  const activeRole = user?.activeRole ?? 'learner';
  const roleLabel = t(getRoleLabelKey(activeRole));

  return (
    <div className="relative min-h-screen bg-background">
      <ParticleBackground />
      <Header />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6">
        {loading ? (
          <div className="home-panel flex min-h-[420px] items-center justify-center">
            <p className="text-sm text-muted-foreground">{t('dashboard.loading')}</p>
          </div>
        ) : (
          <>
            <motion.header
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8 flex flex-col gap-5 border-b border-white/8 pb-8 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="home-grid-bg min-w-0 flex-1 rounded-2xl border border-white/10 bg-card/30 p-6 backdrop-blur-sm md:p-8">
                <p className="home-eyebrow mb-4">{t('dashboard.eyebrow')}</p>
                <h1 className="home-title">{t('dashboard.pageTitle')}</h1>
                <p className="home-subtitle mt-3 max-w-2xl">
                  {t('dashboard.roleBadge')}: <span className="font-semibold text-primary">{roleLabel}</span>
                </p>
              </div>

              {user && (
                <div className="shrink-0 self-end sm:self-start">
                  <RoleSwitcher
                    activeRole={activeRole}
                    roles={user.roles.length > 0 ? user.roles : [activeRole]}
                    onRoleChange={(roleKey) => setUser((prev) => (prev ? { ...prev, activeRole: roleKey } : prev))}
                  />
                </div>
              )}
            </motion.header>

            <RoleDashboardBody activeRole={user?.activeRole ?? null} fullName={user?.fullName ?? null} />
          </>
        )}
      </div>
    </div>
  );
}
