'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';

import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useUserEmail } from '@/hooks/useUserSession';

function formatDateTime(timestamp: number, locale: string) {
  return new Date(timestamp).toLocaleString(locale, { timeZone: 'Asia/Ho_Chi_Minh' });
}

function makeRoomID() {
  const tail = Math.random().toString(36).slice(2, 8);
  return `room-${Date.now().toString(36)}-${tail}`;
}

export default function ClassroomLobbyPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [hostName, setHostName] = useState('');
  const [roomTitle, setRoomTitle] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const rooms = useQuery(api.classrooms.listLiveClassrooms, {}) ?? [];
  const upsertClassroom = useMutation(api.classrooms.upsertClassroom);
  const userEmail = useUserEmail();
  const userSettings = useQuery(api.users.getUserSettings, userEmail ? { email: userEmail } : 'skip');

  const dateLocale =
    language === 'vi' ? 'vi-VN' : language === 'ko' ? 'ko-KR' : 'en-US';

  useEffect(() => {
    setHostName(t('classroom.defaultHost'));
    setRoomTitle(t('classroom.defaultTitle'));
  }, [language, t]);

  const hasRooms = rooms.length > 0;

  const noClassroomMessage = useMemo(() => t('classroom.noRoomsTitle'), [t, language]);

  const startClassroom = async () => {
    const roomID = makeRoomID();
    const title = roomTitle.trim() || t('classroom.defaultTitle');
    const host = hostName.trim() || t('classroom.defaultHost');
    const password = roomPassword.trim() || undefined;

    await upsertClassroom({
      roomID,
      title,
      hostName: host,
      hostUserId: userSettings?.userId ? (userSettings.userId as Id<'users'>) : undefined,
      roomPassword: password,
      status: 'live',
    });

    router.push(
      `/courses/classroom/${encodeURIComponent(roomID)}?host=1&title=${encodeURIComponent(title)}&hostName=${encodeURIComponent(host)}`,
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ParticleBackground />
      <Header />

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-24">
        <section className="glass rounded-3xl border border-border/60 p-8 shadow-[0_24px_70px_-35px_rgba(34,211,238,0.8)] md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                {t('classroom.badge')}
              </p>
              <h1 className="mt-3 text-3xl font-black md:text-4xl">{t('classroom.title')}</h1>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
                {t('classroom.subtitle')}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-5 py-3 text-center">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{t('classroom.liveNow')}</p>
              <p className="text-2xl font-black text-emerald-300">{rooms.length}</p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="glass rounded-3xl border border-border/60 p-6 md:p-7">
            <h2 className="text-xl font-bold">{t('classroom.availableTitle')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('classroom.availableSubtitle')}</p>

            {hasRooms ? (
              <div className="mt-5 grid gap-4">
                {rooms.map((room) => (
                  <div
                    key={room.roomID}
                    className="rounded-2xl border border-border/60 bg-background/70 p-5 transition hover:border-primary/60 hover:shadow-[0_15px_35px_-25px_rgba(34,211,238,0.9)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{room.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {t('classroom.hostedBy')} {room.hostName}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {room.requiresPassword ? (
                          <span className="inline-flex rounded-full border border-amber-400/35 bg-amber-400/15 px-2.5 py-1 text-xs font-semibold text-amber-300">
                            {t('classroom.passwordRequired')}
                          </span>
                        ) : null}
                        <span className="inline-flex rounded-full border border-emerald-400/35 bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                          {t('classroom.live')}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="rounded-md bg-muted/40 px-2.5 py-1">
                        {t('classroom.roomLabel')}: {room.roomID}
                      </span>
                      <span className="rounded-md bg-muted/40 px-2.5 py-1">
                        {t('classroom.startedLabel')}: {formatDateTime(room.startedAt, dateLocale)}
                      </span>
                    </div>

                    <div className="mt-4">
                      <Link
                        href={`/courses/classroom/${encodeURIComponent(room.roomID)}`}
                        className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                      >
                        {t('classroom.joinClassroom')}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-border/70 bg-background/50 p-8 text-center">
                <p className="text-lg font-semibold text-foreground">{noClassroomMessage}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t('classroom.noRoomsHint')}</p>
              </div>
            )}
          </article>

          <aside className="glass rounded-3xl border border-border/60 p-6 md:p-7">
            <h2 className="text-xl font-bold">{t('classroom.startTitle')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('classroom.startSubtitle')}</p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">{t('classroom.hostName')}</label>
                <input
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full rounded-lg border border-border/60 bg-muted/35 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={t('classroom.hostNamePlaceholder')}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">{t('classroom.classroomTitle')}</label>
                <input
                  value={roomTitle}
                  onChange={(e) => setRoomTitle(e.target.value)}
                  className="w-full rounded-lg border border-border/60 bg-muted/35 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={t('classroom.classroomTitlePlaceholder')}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">{t('classroom.passwordOptional')}</label>
                <input
                  type="password"
                  value={roomPassword}
                  onChange={(e) => setRoomPassword(e.target.value)}
                  className="w-full rounded-lg border border-border/60 bg-muted/35 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={t('classroom.passwordPlaceholder')}
                />
                <p className="mt-2 text-xs text-muted-foreground">{t('classroom.passwordHint')}</p>
              </div>

              <button
                type="button"
                onClick={startClassroom}
                className="w-full rounded-lg bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-semibold text-white transition hover:brightness-105"
              >
                {t('classroom.startNow')}
              </button>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
