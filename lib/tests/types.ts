export type TestDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type TestSource = 'curated' | 'ai_generated' | 'template';

export type QuestionType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'short_answer'
  | 'translation'
  | 'sentence_order'
  | 'reading_comprehension';

export interface TestField {
  id: string;
  labelKey: string;
  topicCount: number;
}

export interface TestItem {
  _id?: string;
  externalId: string;
  fieldId: string;
  title: string;
  topicIndex: number;
  variant: number;
  questionCount: number;
  typedQuestionCount: number;
  mcqCount: number;
  durationMinutes: number;
  difficulty: TestDifficulty;
  popularity: number;
  published: boolean;
  source: TestSource;
  featured: boolean;
  description?: string;
}

export interface TestQuestion {
  _id?: string;
  testId?: string;
  order: number;
  type: QuestionType;
  prompt: string;
  passage?: string;
  options?: string[];
  correctIndex?: number;
  modelAnswer: string;
  rubric: string;
  explanation?: string;
  acceptableVariants?: string[];
  maxLength?: number;
}

export interface AiGradeResult {
  correct: boolean;
  score: number;
  feedback: string;
  modelAnswer?: string;
}

export interface TestAnswerRecord {
  questionId: string;
  selectedIndex?: number | null;
  userAnswer?: string;
  score?: number;
  correct?: boolean;
  aiFeedback?: string;
  modelAnswer?: string;
}

export interface TestAttemptSummary {
  _id: string;
  testId: string;
  score?: number;
  maxScore: number;
  status: 'in_progress' | 'submitted' | 'grading';
  submittedAt?: number;
}
