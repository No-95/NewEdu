import { NextResponse } from 'next/server';
import { api } from '@/convex/_generated/api';
import { callGeminiWorker, extractJsonFromReply } from '@/lib/ai/worker-client';
import { getConvexClient } from '@/lib/convex-server';
import { TEST_FIELDS } from '@/lib/tests/fields';
import { buildGenerateTestPrompt, GOLD_EXAMPLES } from '@/lib/tests/prompts/generate';
import { generateRequestSchema, generatedTestBatchSchema } from '@/lib/tests/schemas';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = generateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const args = parsed.data;
  const field = TEST_FIELDS.find((f) => f.id === args.fieldId);
  if (!field) {
    return NextResponse.json({ error: 'Unknown fieldId.' }, { status: 400 });
  }

  const fieldLabel = field.labelKey.split('.').pop() ?? args.fieldId;
  const gold = GOLD_EXAMPLES[args.fieldId]?.[0];
  const goldHint = gold ? `\n\nExample question:\n${JSON.stringify(gold)}` : '';

  const prompt =
    buildGenerateTestPrompt({
      fieldId: args.fieldId,
      fieldLabel,
      difficulty: args.difficulty,
      topicIndex: args.topicIndex,
      variant: args.variant,
      questionCount: args.questionCount,
      locale: args.locale,
    }) + goldHint;

  try {
    const { reply, model } = await callGeminiWorker(prompt, args.locale);
    const jsonText = extractJsonFromReply(reply);
    let batch: unknown;
    try {
      batch = JSON.parse(jsonText);
    } catch {
      return NextResponse.json(
        { error: 'AI returned invalid JSON.', detail: reply.slice(0, 400) },
        { status: 502 }
      );
    }

    const validated = generatedTestBatchSchema.safeParse(batch);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Generated test failed validation.', detail: validated.error.flatten() },
        { status: 502 }
      );
    }

    const externalId = `ai-${args.fieldId}-${args.topicIndex}-${args.variant}-${Date.now()}`;
    const convex = getConvexClient();
    const result = await convex.mutation(api.tests.upsertPublishedTest, {
      externalId,
      fieldId: args.fieldId,
      title: validated.data.title,
      topicIndex: args.topicIndex,
      variant: args.variant,
      difficulty: args.difficulty,
      durationMinutes: Math.max(20, validated.data.questions.length * 3),
      published: args.publish,
      source: 'ai_generated',
      featured: false,
      popularity: 10,
      description: validated.data.description,
      questions: validated.data.questions.map((q, index) => ({
        order: index + 1,
        type: q.type,
        prompt: q.prompt,
        passage: q.passage,
        options: q.options,
        correctIndex: q.correctIndex,
        modelAnswer: q.modelAnswer,
        rubric: q.rubric,
        explanation: q.explanation,
        acceptableVariants: q.acceptableVariants,
        maxLength: q.maxLength,
      })),
    });

    return NextResponse.json({
      success: true,
      model,
      externalId: result.externalId,
      testId: result.testId,
      questionCount: validated.data.questions.length,
      published: args.publish,
    });
  } catch (error) {
    console.error('Error in /api/tests/generate:', error);
    const message = error instanceof Error ? error.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
