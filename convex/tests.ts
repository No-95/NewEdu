import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';

const questionValidator = v.object({
  order: v.number(),
  type: v.union(
    v.literal('multiple_choice'),
    v.literal('fill_blank'),
    v.literal('short_answer'),
    v.literal('translation'),
    v.literal('sentence_order'),
    v.literal('reading_comprehension')
  ),
  prompt: v.string(),
  passage: v.optional(v.string()),
  options: v.optional(v.array(v.string())),
  correctIndex: v.optional(v.number()),
  modelAnswer: v.string(),
  rubric: v.string(),
  explanation: v.optional(v.string()),
  acceptableVariants: v.optional(v.array(v.string())),
  maxLength: v.optional(v.number()),
});

const testDocValidator = v.object({
  _id: v.string(),
  externalId: v.string(),
  fieldId: v.string(),
  title: v.string(),
  topicIndex: v.number(),
  variant: v.number(),
  difficulty: v.union(v.literal('beginner'), v.literal('intermediate'), v.literal('advanced')),
  durationMinutes: v.number(),
  questionCount: v.number(),
  typedQuestionCount: v.number(),
  mcqCount: v.number(),
  published: v.boolean(),
  source: v.union(v.literal('curated'), v.literal('ai_generated'), v.literal('template')),
  featured: v.boolean(),
  popularity: v.number(),
  description: v.optional(v.string()),
});

const questionOutValidator = v.object({
  _id: v.string(),
  testId: v.string(),
  order: v.number(),
  type: v.union(
    v.literal('multiple_choice'),
    v.literal('fill_blank'),
    v.literal('short_answer'),
    v.literal('translation'),
    v.literal('sentence_order'),
    v.literal('reading_comprehension')
  ),
  prompt: v.string(),
  passage: v.optional(v.string()),
  options: v.optional(v.array(v.string())),
  correctIndex: v.optional(v.number()),
  modelAnswer: v.string(),
  rubric: v.string(),
  explanation: v.optional(v.string()),
  acceptableVariants: v.optional(v.array(v.string())),
  maxLength: v.optional(v.number()),
});

function countQuestionTypes(questions: Array<{ type: string }>) {
  const mcq = questions.filter((q) => q.type === 'multiple_choice').length;
  return { mcqCount: mcq, typedQuestionCount: questions.length - mcq };
}

export const listPublishedTests = query({
  args: {
    fieldId: v.optional(v.string()),
    difficulty: v.optional(v.union(v.literal('beginner'), v.literal('intermediate'), v.literal('advanced'))),
  },
  returns: v.array(testDocValidator),
  handler: async (ctx, args) => {
    let rows = await ctx.db
      .query('tests')
      .withIndex('by_published', (q) => q.eq('published', true))
      .collect();

    if (args.fieldId) rows = rows.filter((r) => r.fieldId === args.fieldId);
    if (args.difficulty) rows = rows.filter((r) => r.difficulty === args.difficulty);

    return rows.map((row) => ({
      _id: row._id.toString(),
      externalId: row.externalId,
      fieldId: row.fieldId,
      title: row.title,
      topicIndex: row.topicIndex,
      variant: row.variant,
      difficulty: row.difficulty,
      durationMinutes: row.durationMinutes,
      questionCount: row.questionCount,
      typedQuestionCount: row.typedQuestionCount,
      mcqCount: row.mcqCount,
      published: row.published,
      source: row.source,
      featured: row.featured,
      popularity: row.popularity,
      description: row.description,
    }));
  },
});

export const getPublishedTestByExternalId = query({
  args: { externalId: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      test: testDocValidator,
      questions: v.array(questionOutValidator),
    })
  ),
  handler: async (ctx, args) => {
    const test = await ctx.db
      .query('tests')
      .withIndex('by_externalId', (q) => q.eq('externalId', args.externalId))
      .first();

    if (!test || !test.published) return null;

    const questions = await ctx.db
      .query('testQuestions')
      .withIndex('by_testId_order', (q) => q.eq('testId', test._id))
      .collect();

    return {
      test: {
        _id: test._id.toString(),
        externalId: test.externalId,
        fieldId: test.fieldId,
        title: test.title,
        topicIndex: test.topicIndex,
        variant: test.variant,
        difficulty: test.difficulty,
        durationMinutes: test.durationMinutes,
        questionCount: test.questionCount,
        typedQuestionCount: test.typedQuestionCount,
        mcqCount: test.mcqCount,
        published: test.published,
        source: test.source,
        featured: test.featured,
        popularity: test.popularity,
        description: test.description,
      },
      questions: questions.map((q) => ({
        _id: q._id.toString(),
        testId: q.testId.toString(),
        order: q.order,
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
    };
  },
});

export const upsertPublishedTest = mutation({
  args: {
    externalId: v.string(),
    fieldId: v.string(),
    title: v.string(),
    topicIndex: v.number(),
    variant: v.number(),
    difficulty: v.union(v.literal('beginner'), v.literal('intermediate'), v.literal('advanced')),
    durationMinutes: v.number(),
    published: v.boolean(),
    source: v.union(v.literal('curated'), v.literal('ai_generated'), v.literal('template')),
    featured: v.boolean(),
    popularity: v.number(),
    description: v.optional(v.string()),
    questions: v.array(questionValidator),
  },
  returns: v.object({ testId: v.string(), externalId: v.string() }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const { mcqCount, typedQuestionCount } = countQuestionTypes(args.questions);
    const existing = await ctx.db
      .query('tests')
      .withIndex('by_externalId', (q) => q.eq('externalId', args.externalId))
      .first();

    let testId = existing?._id;
    const testPatch = {
      fieldId: args.fieldId,
      title: args.title,
      topicIndex: args.topicIndex,
      variant: args.variant,
      difficulty: args.difficulty,
      durationMinutes: args.durationMinutes,
      questionCount: args.questions.length,
      typedQuestionCount,
      mcqCount,
      published: args.published,
      source: args.source,
      featured: args.featured,
      popularity: args.popularity,
      description: args.description,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, testPatch);
      const oldQuestions = await ctx.db
        .query('testQuestions')
        .withIndex('by_testId_order', (q) => q.eq('testId', existing._id))
        .collect();
      for (const q of oldQuestions) await ctx.db.delete(q._id);
    } else {
      testId = await ctx.db.insert('tests', {
        externalId: args.externalId,
        ...testPatch,
        createdAt: now,
      });
    }

    if (!testId) throw new Error('Failed to upsert test');

    for (const question of args.questions) {
      await ctx.db.insert('testQuestions', {
        testId,
        ...question,
      });
    }

    return { testId: testId.toString(), externalId: args.externalId };
  },
});

export const listRecentAttemptsForUser = query({
  args: { email: v.string(), limit: v.optional(v.number()) },
  returns: v.array(
    v.object({
      externalId: v.string(),
      title: v.string(),
      scorePercent: v.number(),
      submittedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();
    const attempts = await ctx.db
      .query('testAttempts')
      .withIndex('by_email', (q) => q.eq('email', normalizedEmail))
      .collect();

    const limit = args.limit ?? 5;
    const results = [];

    for (const attempt of attempts
      .sort((a, b) => (b.submittedAt ?? b.startedAt) - (a.submittedAt ?? a.startedAt))
      .slice(0, limit)) {
      const test = await ctx.db.get(attempt.testId);
      if (!test) continue;
      const scorePercent =
        attempt.maxScore > 0 ? Math.round(((attempt.score ?? 0) / attempt.maxScore) * 100) : 0;
      results.push({
        externalId: test.externalId,
        title: test.title,
        scorePercent,
        submittedAt: attempt.submittedAt ?? attempt.startedAt,
      });
    }

    return results;
  },
});

export const submitTestAttempt = mutation({
  args: {
    email: v.optional(v.string()),
    testExternalId: v.string(),
    answers: v.array(
      v.object({
        questionId: v.id('testQuestions'),
        selectedIndex: v.optional(v.number()),
        userAnswer: v.optional(v.string()),
        score: v.number(),
        correct: v.boolean(),
        aiFeedback: v.optional(v.string()),
        modelAnswer: v.optional(v.string()),
      })
    ),
  },
  returns: v.object({
    attemptId: v.string(),
    score: v.number(),
    maxScore: v.number(),
  }),
  handler: async (ctx, args) => {
    const test = await ctx.db
      .query('tests')
      .withIndex('by_externalId', (q) => q.eq('externalId', args.testExternalId))
      .first();
    if (!test) throw new Error('Test not found');

    const now = Date.now();
    const totalScore = args.answers.reduce((sum, a) => sum + a.score, 0);
    const normalizedEmail = args.email?.trim().toLowerCase();
    let userId: Id<'users'> | undefined;
    if (normalizedEmail) {
      const user = await ctx.db
        .query('users')
        .withIndex('by_email', (q) => q.eq('email', normalizedEmail))
        .first();
      userId = user?._id;
    }

    const attemptId = await ctx.db.insert('testAttempts', {
      email: normalizedEmail,
      userId,
      testId: test._id,
      startedAt: now,
      submittedAt: now,
      score: totalScore,
      maxScore: args.answers.length,
      status: 'submitted',
    });

    for (const answer of args.answers) {
      await ctx.db.insert('testAnswers', {
        attemptId,
        questionId: answer.questionId,
        selectedIndex: answer.selectedIndex,
        userAnswer: answer.userAnswer,
        score: answer.score,
        correct: answer.correct,
        aiFeedback: answer.aiFeedback,
        modelAnswer: answer.modelAnswer,
        gradedAt: now,
      });
    }

    await ctx.db.patch(test._id, {
      popularity: test.popularity + 1,
      updatedAt: now,
    });

    return {
      attemptId: attemptId.toString(),
      score: totalScore,
      maxScore: args.answers.length,
    };
  },
});

export const getCatalogStats = query({
  args: {},
  returns: v.object({
    totalTests: v.number(),
    totalQuestions: v.number(),
    fieldIds: v.array(v.string()),
  }),
  handler: async (ctx) => {
    const tests = await ctx.db
      .query('tests')
      .withIndex('by_published', (q) => q.eq('published', true))
      .collect();
    const totalQuestions = tests.reduce((sum, t) => sum + t.questionCount, 0);
    const fieldIds = [...new Set(tests.map((t) => t.fieldId))];
    return { totalTests: tests.length, totalQuestions, fieldIds };
  },
});

export const hasPublishedTests = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const row = await ctx.db
      .query('tests')
      .withIndex('by_published', (q) => q.eq('published', true))
      .first();
    return row !== null;
  },
});
