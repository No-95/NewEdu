import { ConvexHttpClient } from 'convex/browser';
import { NextResponse } from 'next/server';
import { AwsClient } from 'aws4fetch';
import { api } from '@/convex/_generated/api';
import { cookies } from 'next/headers';

function getRequiredConvexUrl(): string {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error('NEXT_PUBLIC_CONVEX_URL is missing.');
  }
  return convexUrl;
}

function getAssetPath(assetPath: string[] | undefined): string {
  const joined = (assetPath ?? []).join('/').trim();
  return joined || 'playlist.m3u8';
}

function buildPublicAssetUrl(videoFolderName: string, assetPath: string): string {
  const configuredBaseUrl = process.env.R2_PUBLIC_BASE_URL;

  if (!configuredBaseUrl) {
    throw new Error('Missing R2_PUBLIC_BASE_URL environment variable.');
  }

  if (configuredBaseUrl.includes('.r2.cloudflarestorage.com')) {
    throw new Error(
      'R2_PUBLIC_BASE_URL is using a private API endpoint. Use a public URL (r2.dev/custom domain) or set R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY.'
    );
  }

  const normalizedBaseUrl = configuredBaseUrl.replace(/\/$/, '');
  return `${normalizedBaseUrl}/${videoFolderName}/${assetPath}`;
}

function getR2SigningClient(): { client: AwsClient; accountId: string; bucket: string } | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const bucket = process.env.R2_BUCKET;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !bucket || !accessKeyId || !secretAccessKey) {
    return null;
  }

  const client = new AwsClient({
    accessKeyId,
    secretAccessKey,
    region: 'auto',
    service: 's3',
  });

  return { client, accountId, bucket };
}

function buildPrivateR2ObjectUrl(accountId: string, bucket: string, key: string): string {
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');
  return `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${encodedKey}`;
}

function getContentType(path: string, upstreamContentType?: string): string {
  if (upstreamContentType) {
    return upstreamContentType;
  }

  if (path.endsWith('.m3u8')) {
    return 'application/vnd.apple.mpegurl';
  }

  if (path.endsWith('.ts')) {
    return 'video/mp2t';
  }

  return 'application/octet-stream';
}

async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    if (value) {
      chunks.push(value);
      totalLength += value.length;
    }
  }

  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }
  return combined;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ courseId: string; videoId: string; assetPath?: string[] }> }
) {
  const { courseId, videoId, assetPath } = await context.params;
  const path = getAssetPath(assetPath);

  try {
    const convex = new ConvexHttpClient(getRequiredConvexUrl());
    const lectureResult = await convex.query(api.courses.getLectureByCourseAndVideoId, {
      slug: courseId,
      videoId,
    });

    if (!lectureResult) {
      return NextResponse.json({ error: 'Video not found.' }, { status: 404 });
    }

    if (!lectureResult.course.isFree) {
      const cookieStore = await cookies();
      const email = cookieStore.get('user_email')?.value;
      if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const user = await convex.query(api.auth.getUserByEmail, { email });
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const hasAccess = await convex.query(api.purchases.hasAccess, {
        userId: user._id,
        courseId: lectureResult.course.slug,
      });
      if (!hasAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const key = `${lectureResult.lecture.videoFolderName}/${path}`;
    const privateR2 = getR2SigningClient();

    if (privateR2) {
      const objectUrl = buildPrivateR2ObjectUrl(privateR2.accountId, privateR2.bucket, key);
      const response = await privateR2.client.fetch(objectUrl);

      if (!response.ok) {
        const body = await response.text();
        const errorMessage = body.slice(0, 300) || 'Video asset not found.';
        return NextResponse.json({ error: errorMessage }, { status: response.status });
      }

      if (!response.body) {
        return NextResponse.json({ error: 'R2 response body was empty.' }, { status: 502 });
      }

      if (path.endsWith('.m3u8')) {
        const content = await response.text();
        return new NextResponse(content, {
          headers: {
            'Content-Type': getContentType(path, response.headers.get('content-type') ?? undefined),
            'Cache-Control': 'private, max-age=60',
          },
        });
      }

      const buffer = await streamToBuffer(response.body);
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': getContentType(path, response.headers.get('content-type') ?? undefined),
          'Cache-Control': 'private, max-age=60',
        },
      });
    }

    const publicUrl = buildPublicAssetUrl(lectureResult.lecture.videoFolderName, path);
    const response = await fetch(publicUrl);

    if (!response.ok) {
      const body = await response.text();
      const errorMessage = body.slice(0, 300) || 'Unable to fetch HLS asset from R2.';
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    if (!response.body) {
      return NextResponse.json({ error: 'R2 response body was empty.' }, { status: 502 });
    }

    if (path.endsWith('.m3u8')) {
      const content = await response.text();
      return new NextResponse(content, {
        headers: {
          'Content-Type': getContentType(path, response.headers.get('content-type') ?? undefined),
          'Cache-Control': 'private, max-age=60',
        },
      });
    }

    const buffer = await streamToBuffer(response.body);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': getContentType(path, response.headers.get('content-type') ?? undefined),
        'Cache-Control': 'private, max-age=60',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to proxy HLS asset.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
