import { ConvexHttpClient } from 'convex/browser';
import { cookies } from 'next/headers';
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

    if (!result.course.isFree) {
      const cookieStore = await cookies();
      const email = cookieStore.get('user_email')?.value;
      if (!email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const user = await convex.query(api.auth.getUserByEmail, { email });
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const hasAccess = await convex.query(api.purchases.hasAccess, {
        userId: user._id,
        courseId: result.course.slug,
      });
      if (!hasAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const streamUrl = buildStreamUrl(courseId, result.lecture.videoFolderName);

    return NextResponse.json(
      { streamUrl },
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
