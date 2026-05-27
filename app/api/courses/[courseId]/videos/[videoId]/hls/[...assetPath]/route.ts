import { ConvexHttpClient } from 'convex/browser';
import { NextResponse } from 'next/server';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { api } from '@/convex/_generated/api';

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

function getR2ClientAndBucket(): { client: S3Client; bucket: string } | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const bucket = process.env.R2_BUCKET;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !bucket || !accessKeyId || !secretAccessKey) {
    return null;
  }

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return { client, bucket };
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

    const key = `${lectureResult.lecture.videoFolderName}/${path}`;
    const privateR2 = getR2ClientAndBucket();

    if (privateR2) {
      const object = await privateR2.client.send(
        new GetObjectCommand({
          Bucket: privateR2.bucket,
          Key: key,
        })
      );

      if (!object.Body) {
        return NextResponse.json({ error: 'Video asset not found.' }, { status: 404 });
      }

      const stream = object.Body.transformToWebStream() as ReadableStream<Uint8Array>;
      return new NextResponse(stream, {
        headers: {
          'Content-Type': getContentType(path, object.ContentType),
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
