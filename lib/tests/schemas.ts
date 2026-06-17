import { z } from 'zod';

export const questionTypeSchema = z.enum([
  'multiple_choice',
  'fill_blank',
  'short_answer',
  'translation',
  'sentence_order',
  'reading_comprehension',
]);

export const generatedQuestionSchema = z.object({
  type: questionTypeSchema,
  prompt: z.string().min(10),
  passage: z.string().optional(),
  options: z.array(z.string()).optional(),
  correctIndex: z.number().int().min(0).optional(),
  modelAnswer: z.string().min(1),
  rubric: z.string().min(10),
  explanation: z.string().optional(),
  acceptableVariants: z.array(z.string()).optional(),
  maxLength: z.number().int().positive().optional(),
});

export const generatedTestBatchSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  questions: z.array(generatedQuestionSchema).min(3).max(30),
});

export const gradeResultSchema = z.object({
  correct: z.boolean(),
  score: z.number().min(0).max(1),
  feedback: z.string().min(1),
  modelAnswer: z.string().optional(),
});

export const gradeRequestSchema = z.object({
  questionId: z.string().optional(),
  type: questionTypeSchema,
  prompt: z.string().min(1),
  modelAnswer: z.string().min(1),
  rubric: z.string().min(1),
  userAnswer: z.string().min(1),
  acceptableVariants: z.array(z.string()).optional(),
  locale: z.enum(['en', 'vi', 'ko']).optional(),
  fieldId: z.string().optional(),
});

export const gradeBatchRequestSchema = z.object({
  items: z.array(gradeRequestSchema).min(1).max(30),
  locale: z.enum(['en', 'vi', 'ko']).optional(),
});

export const generateRequestSchema = z.object({
  fieldId: z.string().min(1),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  topicIndex: z.number().int().min(1).max(10),
  variant: z.number().int().min(1).max(10),
  questionCount: z.number().int().min(5).max(20).default(10),
  locale: z.enum(['en', 'vi', 'ko']).default('vi'),
  publish: z.boolean().default(false),
});

export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>;
export type GradeResult = z.infer<typeof gradeResultSchema>;
