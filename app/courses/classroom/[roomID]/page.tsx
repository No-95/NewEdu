'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'convex/react';
import { useQuery } from 'convex/react';

import { api } from '@/convex/_generated/api';

const FALLBACK_APP_ID = 'vpaas-magic-cookie-acd82c59b18f421aa23114905dfe4ca3';

export default function ClassroomRoomPage() {
  const params = useParams<{ roomID: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const meetingContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const hasRedirectedRef = useRef(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [accessGranted, setAccessGranted] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const upsertClassroom = useMutation(api.classrooms.upsertClassroom);
  const touchClassroom = useMutation(api.classrooms.touchClassroom);
  const validateClassroomPassword = useMutation(api.classrooms.validateClassroomPassword);

  const roomID = decodeURIComponent(params.roomID ?? '');
  const isHost = searchParams.get('host') === '1';
  const roomTitle = searchParams.get('title') || 'Korean Production Live Classroom';
  const hostName = searchParams.get('hostName') || 'HDP EDU Host';
  const classroomAccess = useQuery(api.classrooms.getClassroomAccess, { roomID });

  const appId = process.env.NEXT_PUBLIC_JITSI_APP_ID || FALLBACK_APP_ID;

  const roomName = useMemo(() => {
    if (!roomID) return '';
    return `${appId}/${roomID}`;
  }, [appId, roomID]);

  const requiresPassword = !isHost && Boolean(classroomAccess?.requiresPassword);
  const canAccessRoom = isHost || !requiresPassword || accessGranted;

  useEffect(() => {
    setAccessGranted(isHost);
    setPasswordInput('');
    setPasswordError('');
    hasRedirectedRef.current = false;
  }, [isHost, roomID]);

  useEffect(() => {
    if (!canAccessRoom || !roomName || !meetingContainerRef.current) return;

    let isDisposed = false;

    const handleLeaveMeeting = () => {
      if (hasRedirectedRef.current) return;
      hasRedirectedRef.current = true;
      router.push('/courses/classroom');
    };

    const mountMeeting = async () => {
      const existingApi = jitsiApiRef.current;
      if (existingApi) {
        existingApi.dispose();
        jitsiApiRef.current = null;
      }

      if (meetingContainerRef.current) {
        meetingContainerRef.current.innerHTML = '';
      }

      if (!(window as any).JitsiMeetExternalAPI) {
        await new Promise<void>((resolve, reject) => {
          const existingScript = document.querySelector<HTMLScriptElement>(
            'script[data-jitsi-external-api="1"]'
          );

          if (existingScript) {
            if ((window as any).JitsiMeetExternalAPI) {
              resolve();
              return;
            }
            existingScript.addEventListener('load', () => resolve(), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('Failed to load Jitsi API')), {
              once: true,
            });
            return;
          }

          const script = document.createElement('script');
          script.src = 'https://8x8.vc/external_api.js';
          script.async = true;
          script.dataset.jitsiExternalApi = '1';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Jitsi API'));
          document.body.appendChild(script);
        });
      }

      if (isDisposed || !meetingContainerRef.current || !(window as any).JitsiMeetExternalAPI) {
        return;
      }

      const apiInstance = new (window as any).JitsiMeetExternalAPI('8x8.vc', {
        roomName,
        parentNode: meetingContainerRef.current,
        userInfo: {
          displayName: isHost ? hostName : 'Student',
        },
        configOverwrite: {
          prejoinPageEnabled: false,
        },
      });

      apiInstance.addListener('videoConferenceLeft', handleLeaveMeeting);
      apiInstance.addListener('readyToClose', handleLeaveMeeting);
      jitsiApiRef.current = apiInstance;
    };

    void mountMeeting();

    return () => {
      isDisposed = true;
      const apiInstance = jitsiApiRef.current;
      if (apiInstance) {
        apiInstance.removeListener?.('videoConferenceLeft', handleLeaveMeeting);
        apiInstance.removeListener?.('readyToClose', handleLeaveMeeting);
        apiInstance.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [canAccessRoom, hostName, isHost, roomName, router]);

  useEffect(() => {
    if (!roomID || !canAccessRoom) return;

    if (isHost) {
      void upsertClassroom({
        roomID,
        title: roomTitle,
        hostName,
        roomPassword: undefined,
        status: 'live',
      });
    } else {
      void touchClassroom({ roomID });
    }

    const interval = window.setInterval(() => {
      void touchClassroom({ roomID });
    }, 15000);
    return () => window.clearInterval(interval);
  }, [canAccessRoom, hostName, isHost, roomID, roomTitle, touchClassroom, upsertClassroom]);

  const handleUnlockRoom = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError('');

    if (!passwordInput.trim()) {
      setPasswordError('Please enter the classroom password.');
      return;
    }

    try {
      setIsCheckingPassword(true);
      const isValid = await validateClassroomPassword({
        roomID,
        password: passwordInput,
      });

      if (!isValid) {
        setPasswordError('Incorrect password. Please try again.');
        return;
      }

      setAccessGranted(true);
      setPasswordInput('');
    } finally {
      setIsCheckingPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] h-screen w-screen overflow-hidden bg-black text-foreground">
      {!roomID ? (
        <div className="flex h-full w-full items-center justify-center bg-background px-6 text-center">
          <p className="text-sm text-muted-foreground">Invalid room ID.</p>
        </div>
      ) : classroomAccess && !classroomAccess.exists ? (
        <div className="flex h-full w-full items-center justify-center bg-background px-6 text-center">
          <p className="text-sm text-muted-foreground">This classroom is no longer available.</p>
        </div>
      ) : requiresPassword && !accessGranted ? (
        <div className="flex h-full w-full items-center justify-center bg-background px-6">
          <form
            onSubmit={handleUnlockRoom}
            className="w-full max-w-md rounded-2xl border border-border/60 bg-card/80 p-6 shadow-2xl"
          >
            <h1 className="text-2xl font-black text-foreground">Classroom Locked</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the classroom password from your teacher to join.
            </p>

            <div className="mt-5">
              <label htmlFor="classroom-password" className="mb-2 block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="classroom-password"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full rounded-lg border border-border/60 bg-muted/35 px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter classroom password"
                autoFocus
              />
            </div>

            {passwordError ? <p className="mt-3 text-sm text-red-400">{passwordError}</p> : null}

            <button
              type="submit"
              disabled={isCheckingPassword}
              className="mt-5 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCheckingPassword ? 'Checking...' : 'Join classroom'}
            </button>
          </form>
        </div>
      ) : roomName ? (
        <div ref={meetingContainerRef} className="h-full w-full" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-background px-6 text-center">
          <p className="text-sm text-muted-foreground">Invalid room ID.</p>
        </div>
      )}
    </div>
  );
}
