import type { GeneratedQuestion } from '@/lib/tests/schemas';

const LOCALE_LABELS = {
  en: 'English',
  vi: 'Vietnamese',
  ko: 'Korean',
};

export function buildGenerateTestPrompt(args: {
  fieldId: string;
  fieldLabel: string;
  difficulty: string;
  topicIndex: number;
  variant: number;
  questionCount: number;
  locale: 'en' | 'vi' | 'ko';
}): string {
  const localeLabel = LOCALE_LABELS[args.locale];
  const mcqCount = Math.max(2, Math.floor(args.questionCount * 0.3));
  const typedCount = args.questionCount - mcqCount;

  return `You are an HDP EDU assessment author. Create ONE practice test as valid JSON only.

Field: ${args.fieldLabel} (${args.fieldId})
Difficulty: ${args.difficulty}
Topic set: ${args.topicIndex}, variant ${args.variant}
Primary locale for prompts: ${localeLabel}
Total questions: ${args.questionCount} (${mcqCount} multiple_choice + ${typedCount} typed)

Return JSON with this exact shape:
{
  "title": "string",
  "description": "string",
  "questions": [
    {
      "type": "multiple_choice" | "fill_blank" | "short_answer" | "translation" | "sentence_order" | "reading_comprehension",
      "prompt": "string",
      "passage": "optional string for reading_comprehension",
      "options": ["A","B","C","D"],
      "correctIndex": 0,
      "modelAnswer": "string",
      "rubric": "grading criteria for typed answers",
      "explanation": "string",
      "acceptableVariants": ["optional alt answers"],
      "maxLength": 500
    }
  ]
}

Rules:
- multiple_choice MUST include options (4 items) and correctIndex
- Typed questions MUST NOT rely on options; include strong modelAnswer and rubric
- For Korean fields, include Hangul in prompts and model answers where appropriate
- TOPIK-style: mix grammar, vocabulary, reading for topik_exam field
- No markdown outside JSON. No commentary.`;
}

export function buildGradePrompt(args: {
  type: string;
  prompt: string;
  modelAnswer: string;
  rubric: string;
  userAnswer: string;
  acceptableVariants?: string[];
  locale?: 'en' | 'vi' | 'ko';
  fieldId?: string;
}): string {
  const variants =
    args.acceptableVariants && args.acceptableVariants.length > 0
      ? `\nAcceptable variants: ${args.acceptableVariants.join(' | ')}`
      : '';

  return `You are an HDP EDU exam grader. Grade the learner answer. Return JSON only:
{"correct": boolean, "score": number between 0 and 1, "feedback": "string", "modelAnswer": "string"}

Question type: ${args.type}
Field: ${args.fieldId ?? 'general'}
Locale: ${args.locale ?? 'vi'}

Question:
${args.prompt}

Model answer:
${args.modelAnswer}

Rubric:
${args.rubric}${variants}

Learner answer:
${args.userAnswer}

Grading rules:
- Accept minor spacing/typo for Korean/English if meaning is correct
- Penalize wrong particles, tense, or meaning errors
- score 1.0 = fully correct, 0.5 = partially correct, 0 = incorrect
- feedback must be constructive and specific (1-3 sentences)
- Respond in the same language as the learner answer when possible`;
}

export const GOLD_EXAMPLES: Record<string, GeneratedQuestion[]> = {
  korean_grammar: [
    {
      type: 'fill_blank',
      prompt: 'Complete with the correct particle: 저는 학교___ 갑니다.',
      modelAnswer: '에',
      rubric: 'Must use the location particle 에 after school when indicating direction to a place.',
      explanation: '에 marks destination with motion verbs like 가다.',
      acceptableVariants: ['에'],
      maxLength: 20,
    },
  ],
  topik_exam: [
    {
      type: 'translation',
      prompt: 'Translate to Korean: "I am a university student."',
      modelAnswer: '저는 대학생입니다.',
      rubric: 'Correct copula, topic marker optional but natural phrasing required.',
      acceptableVariants: ['나는 대학생입니다.', '저는 대학생이에요.'],
      maxLength: 100,
    },
  ],
};
