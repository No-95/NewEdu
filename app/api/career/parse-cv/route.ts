import { NextResponse } from 'next/server';
import { api } from '@/convex/_generated/api';
import { callGeminiWorker, extractJsonFromReply } from '@/lib/ai/worker-client';
import {
  buildCvParsePrompt,
  cvDraftSchema,
  normalizeCvDraft,
} from '@/lib/career/cvParseSchema';
import { getAuthenticatedUser } from '@/lib/auth';
import { getConvexClient } from '@/lib/convex-server';

export const runtime = 'nodejs';

async function extractTextFromFile(buffer: Buffer, fileName: string): Promise<string> {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.txt')) {
    return buffer.toString('utf8');
  }
  if (lower.endsWith('.pdf')) {
    const pdfParse = (await import('pdf-parse')).default;
    const parsed = await pdfParse(buffer);
    return parsed.text ?? '';
  }
  if (lower.endsWith('.doc') || lower.endsWith('.docx')) {
    throw new Error('Word documents are not supported yet. Please upload a PDF or TXT file.');
  }
  throw new Error('Unsupported file type. Upload PDF or TXT.');
}

export async function POST() {
  const user = await getAuthenticatedUser();
  if (!user?.email) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const email = user.email;
  const convex = getConvexClient();

  try {
    await convex.mutation(api.career.beginCvParse, { email });

    const download = await convex.query(api.career.getCvDownloadUrl, { email });
    if (!download?.downloadUrl) {
      await convex.mutation(api.career.failCvParse, {
        email,
        error: 'No CV file found. Upload a CV first.',
      });
      return NextResponse.json({ error: 'No CV file found.' }, { status: 400 });
    }

    const fileResponse = await fetch(download.downloadUrl);
    if (!fileResponse.ok) {
      throw new Error('Failed to download CV from storage.');
    }

    const buffer = Buffer.from(await fileResponse.arrayBuffer());
    const contentDisposition = fileResponse.headers.get('content-disposition') ?? '';
    const nameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
    const fileName = nameMatch?.[1] ?? 'cv.pdf';

    const cvText = (await extractTextFromFile(buffer, fileName)).trim();
    if (cvText.length < 40) {
      throw new Error('Could not extract enough text from the file. Try a text-based PDF.');
    }

    const { reply } = await callGeminiWorker(buildCvParsePrompt(cvText));
    const jsonText = extractJsonFromReply(reply);
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      throw new Error('AI returned invalid JSON for CV parsing.');
    }

    const validated = cvDraftSchema.safeParse(parsed);
    if (!validated.success) {
      throw new Error('Parsed CV data failed validation.');
    }

    const draft = normalizeCvDraft(validated.data);
    await convex.mutation(api.career.completeCvParseDraft, { email, draft });

    return NextResponse.json({ success: true, draft });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CV parsing failed.';
    try {
      await convex.mutation(api.career.failCvParse, { email, error: message });
    } catch {
      // ignore secondary failure
    }
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
