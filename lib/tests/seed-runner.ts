import { api } from '@/convex/_generated/api';
import { getConvexClient } from '@/lib/convex-server';
import { CURATED_FLAGSHIP_TESTS } from '@/lib/tests/curated-seed';
import { buildTemplateQuestions, buildTemplateTestShells } from '@/lib/tests/template-bank';

export async function seedAllTests() {
  const convex = getConvexClient();
  const hasTests = await convex.query(api.tests.hasPublishedTests, {});
  if (hasTests) {
    return { seeded: false, message: 'Tests already exist' };
  }

  let inserted = 0;

  for (const test of CURATED_FLAGSHIP_TESTS) {
    await convex.mutation(api.tests.upsertPublishedTest, {
      externalId: test.externalId,
      fieldId: test.fieldId,
      title: test.title,
      topicIndex: test.topicIndex,
      variant: test.variant,
      difficulty: test.difficulty,
      durationMinutes: test.durationMinutes,
      published: true,
      source: test.source,
      featured: test.featured,
      popularity: test.popularity,
      description: test.description,
      questions: test.questions.map((q, index) => ({
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
    inserted += 1;
  }

  const shells = buildTemplateTestShells();
  for (const shell of shells) {
    const questions = buildTemplateQuestions(
      shell.fieldId,
      shell.difficulty,
      shell.topicIndex,
      shell.variant,
      shell.questionCount,
      'Vietnamese'
    );

    await convex.mutation(api.tests.upsertPublishedTest, {
      externalId: shell.externalId,
      fieldId: shell.fieldId,
      title: shell.title,
      topicIndex: shell.topicIndex,
      variant: shell.variant,
      difficulty: shell.difficulty,
      durationMinutes: shell.durationMinutes,
      published: true,
      source: 'template',
      featured: false,
      popularity: 40 + (inserted * 17) % 60,
      description: `Template practice test for ${shell.fieldId}.`,
      questions: questions.map((q, index) => ({
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
    inserted += 1;
  }

  return { seeded: true, inserted };
}
