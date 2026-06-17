import { NextResponse } from 'next/server';
import { callGeminiWorker, extractJsonFromReply } from '@/lib/ai/worker-client';
import { buildGradePrompt } from '@/lib/tests/prompts/generate';
import { gradeBatchRequestSchema, gradeResultSchema } from '@/lib/tests/schemas';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = gradeBatchRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { items, locale } = parsed.data;
  const results: Array<{ questionId?: string; grade: ReturnType<typeof gradeResultSchema.parse> }> = [];

  try {
    for (const item of items) {
      const prompt = buildGradePrompt({
        type: item.type,
        prompt: item.prompt,
        modelAnswer: item.modelAnswer,
        rubric: item.rubric,
        userAnswer: item.userAnswer.slice(0, 2000),
        acceptableVariants: item.acceptableVariants,
        locale: item.locale ?? locale,
        fieldId: item.fieldId,
      });

      const { reply } = await callGeminiWorker(prompt, item.locale ?? locale);
      const jsonText = extractJsonFromReply(reply);
      let gradeJson: unknown;
      try {
        gradeJson = JSON.parse(jsonText);
      } catch {
        return NextResponse.json(
          { error: 'AI returned invalid grade JSON.', detail: reply.slice(0, 300) },
          { status: 502 }
        );
      }

      const grade = gradeResultSchema.safeParse(gradeJson);
      if (!grade.success) {
        return NextResponse.json(
          { error: 'Grade schema validation failed.', detail: grade.error.flatten() },
          { status: 502 }
        );
      }

      results.push({ questionId: item.questionId, grade: grade.data });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in /api/tests/grade:', error);
    const message = error instanceof Error ? error.message : 'Grading failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
