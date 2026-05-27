import { ConvexHttpClient } from 'convex/browser';
import { NextResponse } from 'next/server';
import { api } from '@/convex/_generated/api';

function buildStreamUrl(courseId: string, videoId: string): string {
  return `/api/courses/${courseId}/videos/${videoId}/hls/playlist.m3u8`;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ courseId: string; videoId: string }> }
) {
  const { courseId, videoId } = await context.params;

  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_CONVEX_URL is missing.' }, { status: 500 });
    }

    const convex = new ConvexHttpClient(convexUrl);
    const result = await convex.query(api.courses.getLectureByCourseAndVideoId, {
      slug: courseId,
      videoId,
    });

    if (!result) {
      return NextResponse.json({ error: 'Video not found.' }, { status: 404 });
    }

    const streamUrl = buildStreamUrl(courseId, result.lecture.videoFolderName);

    return NextResponse.json(
      {
        streamUrl,
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=60',
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to build stream URL.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
