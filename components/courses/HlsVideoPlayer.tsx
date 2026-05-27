'use client';

import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';

import { markLectureCompleted } from '@/hooks/useCourseProgress';

interface HlsVideoPlayerProps {
  courseId: string;
  videoId: string;
  title: string;
}

interface StreamApiResponse {
  streamUrl: string;
}

export function HlsVideoPlayer({ courseId, videoId, title }: HlsVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let hls: Hls | null = null;
    let isMounted = true;

    const handleEnded = () => {
      markLectureCompleted(courseId, videoId);
    };

    async function setupPlayer() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/courses/${courseId}/videos/${videoId}/stream`);

        if (!response.ok) {
          throw new Error('Khong the tai duoc duong dan stream cho video nay.');
        }

        const data = (await response.json()) as StreamApiResponse;
        const videoElement = videoRef.current;

        if (!videoElement || !isMounted) {
          return;
        }

        videoElement.addEventListener('ended', handleEnded);

        // Probe the playlist URL first so API errors are shown directly in UI.
        const playlistProbe = await fetch(data.streamUrl);
        if (!playlistProbe.ok) {
          const contentType = playlistProbe.headers.get('content-type') || '';
          let details = 'Khong the tai playlist video tu may chu.';

          if (contentType.includes('application/json')) {
            const payload = (await playlistProbe.json()) as { error?: string };
            if (payload?.error) {
              details = payload.error;
            }
          }

          throw new Error(details);
        }

        const hlsMimeType = 'application/vnd.apple.mpegurl';

        if (Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });

          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (!isMounted || !data.fatal) {
              return;
            }

            const details = data.details ? ` (${data.details})` : '';
            setError(`Khong the phat HLS stream${details}.`);
            setIsLoading(false);
          });

          hls.loadSource(data.streamUrl);
          hls.attachMedia(videoElement);
        } else if (videoElement.canPlayType(hlsMimeType)) {
          videoElement.src = data.streamUrl;
        } else {
          throw new Error('Trinh duyet hien tai khong ho tro HLS playback.');
        }
      } catch (setupError) {
        const message = setupError instanceof Error ? setupError.message : 'Da xay ra loi khi tai video.';
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    setupPlayer();

    return () => {
      isMounted = false;

      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.removeEventListener('ended', handleEnded);
      }

      if (hls) {
        hls.destroy();
      }
    };
  }, [courseId, videoId]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">
        <p className="font-medium">Khong the phat video</p>
        <p className="mt-1 text-sm opacity-90">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
          Dang tai video...
        </div>
      ) : null}

      <video
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        className="w-full rounded-2xl border border-border/50 bg-black"
        aria-label={title}
      />
    </div>
  );
}
