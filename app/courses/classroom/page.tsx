'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';

import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
import { api } from '@/convex/_generated/api';

function formatDateTime(timestamp: number) {
  return new Date(timestamp).toLocaleString();
}

function makeRoomID() {
  const tail = Math.random().toString(36).slice(2, 8);
  return `room-${Date.now().toString(36)}-${tail}`;
}

export default function ClassroomLobbyPage() {
  const router = useRouter();
  const [hostName, setHostName] = useState('HDP EDU Host');
  const [roomTitle, setRoomTitle] = useState('Korean Production Live Classroom');
  const [roomPassword, setRoomPassword] = useState('');
  const rooms = useQuery(api.classrooms.listLiveClassrooms, {}) ?? [];
  const upsertClassroom = useMutation(api.classrooms.upsertClassroom);

  const hasRooms = rooms.length > 0;

  const noClassroomMessage = useMemo(
    () => 'No classroom available, Start your classroom now',
    []
  );

  const startClassroom = async () => {
    const roomID = makeRoomID();
    const title = roomTitle.trim() || 'Korean Production Live Classroom';
    const host = hostName.trim() || 'HDP EDU Host';
    const password = roomPassword.trim() || undefined;

    await upsertClassroom({
      roomID,
      title,
      hostName: host,
      roomPassword: password,
      status: 'live',
    });

    router.push(
      `/courses/classroom/${encodeURIComponent(roomID)}?host=1&title=${encodeURIComponent(title)}&hostName=${encodeURIComponent(host)}`
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
                Online Classroom
              </p>
              <h1 className="mt-3 text-3xl font-black md:text-4xl">Live Classroom Lobby</h1>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
                Join currently running classrooms or start a new session instantly.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-5 py-3 text-center">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Live now</p>
              <p className="text-2xl font-black text-emerald-300">{rooms.length}</p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="glass rounded-3xl border border-border/60 p-6 md:p-7">
            <h2 className="text-xl font-bold">Available Classrooms</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose a room and join in one click.</p>

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
                        <p className="mt-1 text-sm text-muted-foreground">Hosted by {room.hostName}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {room.requiresPassword ? (
                          <span className="inline-flex rounded-full border border-amber-400/35 bg-amber-400/15 px-2.5 py-1 text-xs font-semibold text-amber-300">
                            Password required
                          </span>
                        ) : null}
                        <span className="inline-flex rounded-full border border-emerald-400/35 bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                          Live
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="rounded-md bg-muted/40 px-2.5 py-1">Room: {room.roomID}</span>
                      <span className="rounded-md bg-muted/40 px-2.5 py-1">Started: {formatDateTime(room.startedAt)}</span>
                    </div>

                    <div className="mt-4">
                      <Link
                        href={`/courses/classroom/${encodeURIComponent(room.roomID)}`}
                        className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                      >
                        Join classroom
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-border/70 bg-background/50 p-8 text-center">
                <p className="text-lg font-semibold text-foreground">{noClassroomMessage}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create a room from the panel on the right and go live in seconds.
                </p>
              </div>
            )}
          </article>

          <aside className="glass rounded-3xl border border-border/60 p-6 md:p-7">
            <h2 className="text-xl font-bold">Start new classroom</h2>
            <p className="mt-1 text-sm text-muted-foreground">Create a new live room and invite learners.</p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Host name</label>
                <input
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full rounded-lg border border-border/60 bg-muted/35 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Classroom title</label>
                <input
                  value={roomTitle}
                  onChange={(e) => setRoomTitle(e.target.value)}
                  className="w-full rounded-lg border border-border/60 bg-muted/35 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Korean Production Live Classroom"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Classroom password (optional)</label>
                <input
                  type="password"
                  value={roomPassword}
                  onChange={(e) => setRoomPassword(e.target.value)}
                  className="w-full rounded-lg border border-border/60 bg-muted/35 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Set password for students"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Leave empty if anyone can join.
                </p>
              </div>

              <button
                type="button"
                onClick={startClassroom}
                className="w-full rounded-lg bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-semibold text-white transition hover:brightness-105"
              >
                Start classroom now
              </button>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
