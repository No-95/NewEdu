import type { GeneratedQuestion } from '@/lib/tests/schemas';
import type { TestDifficulty } from '@/lib/tests/types';

const TOPICS = [
  'Fundamentals',
  'Daily Practice',
  'Review Set',
  'Challenge',
  'Mock Exam',
  'Advanced Drill',
  'Quick Check',
  'Master Test',
  'Skills Boost',
  'Final Review',
];

const FIELD_PROMPTS: Record<string, { mcq: string[]; typed: string[] }> = {
  korean_vocabulary: {
    mcq: ['What is the meaning of "{word}"?', 'Which word is a synonym of "{word}"?'],
    typed: ['Write the Korean word for "{word}".', 'Use "{word}" in a complete Korean sentence.'],
  },
  korean_grammar: {
    mcq: ['Choose the correct particle for: {sentence}', 'Select the correct verb form: {sentence}'],
    typed: ['Fill in the blank: {sentence}', 'Explain the grammar rule used in: {sentence}'],
  },
  korean_listening: {
    mcq: ['What is the best response to "{phrase}"?', 'What does "{phrase}" mean in conversation?'],
    typed: ['Write an appropriate reply to "{phrase}".', 'Translate "{phrase}" to {locale}.'],
  },
  korean_reading: {
    mcq: ['What is the main idea of: "{passage}"?', 'What does "{sign}" mean?'],
    typed: ['Summarize this notice in one sentence: "{passage}"', 'Translate the sign "{sign}".'],
  },
  korean_writing: {
    mcq: ['Choose the most formal expression:', 'Select the best paragraph opener:'],
    typed: ['Write 2–3 formal sentences about {topic}.', 'Rewrite this informally in formal Korean: {sentence}'],
  },
  topik_exam: {
    mcq: ['TOPIK-style grammar: {sentence}', 'Choose the best answer for TOPIK reading: {passage}'],
    typed: ['Translate to Korean: "{sentence}"', 'Write a TOPIK-style answer for: {prompt}'],
  },
  business_korean: {
    mcq: ['Best business expression for: {context}', 'Formal email phrase for: {context}'],
    typed: ['Write a formal business sentence about {context}.', 'Translate workplace phrase: {phrase}'],
  },
  korean_culture: {
    mcq: ['What is {holiday}?', 'Correct etiquette in Korea: {situation}'],
    typed: ['Describe {custom} in Korean or {locale}.', 'Explain the meaning of {holiday}.'],
  },
  english_skills: {
    mcq: ['Choose the correct English form: {sentence}', 'Best translation: {phrase}'],
    typed: ['Fill in the blank: {sentence}', 'Write one sentence using "{word}".'],
  },
  it_technology: {
    mcq: ['What does {term} stand for?', 'Best practice for {topic}:'],
    typed: ['Define {term} in one sentence.', 'Explain {concept} briefly.'],
  },
  business_finance: {
    mcq: ['Finance concept: {term}', 'Choose the correct definition of {term}:'],
    typed: ['Explain {term} in business context.', 'Give an example of {concept}.'],
  },
  career_skills: {
    mcq: ['Interview best practice: {situation}', 'Career skill for: {context}'],
    typed: ['Answer this interview question: {question}', 'Write a STAR response outline for: {situation}'],
  },
};

const WORDS = ['학교', '친구', '회사', '시간', '공부', '회의', '여행', '건강'];
const PHRASES = ['안녕하세요', '감사합니다', '잠시만요', '어서 오세요', '수고하세요'];
const PASSAGES = [
  '오늘 회의는 3시에 시작됩니다.',
  '공공장소에서는 조용히 해 주세요.',
  '신입 사원 교육은 월요일에 있습니다.',
];

export function buildTemplateQuestions(
  fieldId: string,
  difficulty: TestDifficulty,
  topicIndex: number,
  variant: number,
  count: number,
  localeLabel: string
): GeneratedQuestion[] {
  const bank = FIELD_PROMPTS[fieldId] ?? FIELD_PROMPTS.korean_vocabulary;
  const topic = TOPICS[(topicIndex - 1) % TOPICS.length] ?? 'Practice';
  const questions: GeneratedQuestion[] = [];
  const mcqTarget = Math.max(2, Math.floor(count * 0.3));

  for (let i = 0; i < count; i += 1) {
    const word = WORDS[(i + variant) % WORDS.length];
    const phrase = PHRASES[(i + topicIndex) % PHRASES.length];
    const passage = PASSAGES[(i + variant) % PASSAGES.length];
    const isMcq = i < mcqTarget;

    if (isMcq) {
      const template = bank.mcq[i % bank.mcq.length];
      const prompt = `${template
        .replace('{word}', word)
        .replace('{phrase}', phrase)
        .replace('{passage}', passage)
        .replace('{sentence}', `저는 ${word}___`)
        .replace('{context}', topic)
        .replace('{holiday}', 'Seollal')
        .replace('{situation}', 'meeting a manager')
        .replace('{term}', 'API')
        .replace('{topic}', topic)} (${topic} #${variant})`;

      questions.push({
        type: 'multiple_choice',
        prompt,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctIndex: i % 4,
        modelAnswer: 'Option A',
        rubric: `Correct answer for ${fieldId} at ${difficulty} level.`,
        explanation: `Review ${topic} materials for ${fieldId}.`,
      });
    } else {
      const typePool = ['fill_blank', 'short_answer', 'translation', 'sentence_order'] as const;
      const type = typePool[(i + topicIndex) % typePool.length];
      const template = bank.typed[i % bank.typed.length];
      const prompt = template
        .replace('{word}', word)
        .replace('{phrase}', phrase)
        .replace('{passage}', passage)
        .replace('{sentence}', `"I study Korean every day."`)
        .replace('{locale}', localeLabel)
        .replace('{topic}', topic)
        .replace('{context}', topic)
        .replace('{custom}', 'removing shoes indoors')
        .replace('{holiday}', 'Chuseok')
        .replace('{question}', 'Tell me about yourself')
        .replace('{situation}', 'team conflict')
        .replace('{term}', 'cloud computing')
        .replace('{concept}', 'agile workflow')
        .replace('{prompt}', `Describe your ${topic} experience`);

      questions.push({
        type,
        prompt: `${prompt} (${topic} #${variant})`,
        passage: undefined,
        modelAnswer:
          type === 'translation'
            ? `Sample translation for ${word}.`
            : type === 'fill_blank'
              ? word
              : `Model answer demonstrating ${topic} at ${difficulty} level.`,
        rubric: `Evaluate accuracy, grammar, and relevance for ${fieldId}. Accept minor typos. Difficulty: ${difficulty}.`,
        acceptableVariants: [word],
        maxLength: type === 'short_answer' ? 400 : 120,
      });
    }
  }

  return questions;
}

export function buildTemplateTestShells() {
  const fields = [
    { id: 'korean_vocabulary', topicCount: 8 },
    { id: 'korean_grammar', topicCount: 8 },
    { id: 'korean_listening', topicCount: 8 },
    { id: 'korean_reading', topicCount: 8 },
    { id: 'korean_writing', topicCount: 6 },
    { id: 'topik_exam', topicCount: 10 },
    { id: 'business_korean', topicCount: 6 },
    { id: 'korean_culture', topicCount: 6 },
    { id: 'english_skills', topicCount: 8 },
    { id: 'it_technology', topicCount: 8 },
    { id: 'business_finance', topicCount: 6 },
    { id: 'career_skills', topicCount: 8 },
  ];
  const difficulties: TestDifficulty[] = ['beginner', 'intermediate', 'advanced'];
  const shells: Array<{
    externalId: string;
    fieldId: string;
    title: string;
    topicIndex: number;
    variant: number;
    difficulty: TestDifficulty;
    durationMinutes: number;
    questionCount: number;
  }> = [];
  let counter = 1;

  for (const field of fields) {
    for (let topicIndex = 1; topicIndex <= field.topicCount; topicIndex += 1) {
      for (let variant = 1; variant <= 4; variant += 1) {
        const difficulty = difficulties[(topicIndex + variant + counter) % difficulties.length];
        shells.push({
          externalId: `test-${String(counter).padStart(4, '0')}`,
          fieldId: field.id,
          title: `${field.id} · ${TOPICS[(topicIndex - 1) % TOPICS.length]} #${variant}`,
          topicIndex,
          variant,
          difficulty,
          durationMinutes: 15 + ((topicIndex + variant) % 6) * 5,
          questionCount: 10 + ((topicIndex + variant) % 5) * 2,
        });
        counter += 1;
      }
    }
  }
  return shells;
}
