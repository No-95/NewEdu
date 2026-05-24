import { getCourseById, getLectureById } from '@/lib/data/courses';
import { NextResponse } from 'next/server';

function buildStreamUrl(videoFolderName: string): string {
  const configuredBaseUrl = process.env.R2_PUBLIC_BASE_URL;

  if (!configuredBaseUrl) {
    throw new Error('Missing R2_PUBLIC_BASE_URL environment variable.');
  }

  const normalizedBaseUrl = configuredBaseUrl.replace(/\/$/, '');

  return `${normalizedBaseUrl}/${videoFolderName}/playlist.m3u8`;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ courseId: string; videoId: string }> }
) {
  const { courseId, videoId } = await context.params;

  const course = getCourseById(courseId);

  if (!course) {
    return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
  }

  const lecture = getLectureById(courseId, videoId);

  if (!lecture) {
    return NextResponse.json({ error: 'Video not found.' }, { status: 404 });
  }

  try {
    const streamUrl = buildStreamUrl(lecture.videoFolderName);

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
