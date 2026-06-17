import type { TestField } from './types';

export const TEST_FIELDS: TestField[] = [
  { id: 'korean_vocabulary', labelKey: 'testsPage.fields.korean_vocabulary', topicCount: 8 },
  { id: 'korean_grammar', labelKey: 'testsPage.fields.korean_grammar', topicCount: 8 },
  { id: 'korean_listening', labelKey: 'testsPage.fields.korean_listening', topicCount: 8 },
  { id: 'korean_reading', labelKey: 'testsPage.fields.korean_reading', topicCount: 8 },
  { id: 'korean_writing', labelKey: 'testsPage.fields.korean_writing', topicCount: 6 },
  { id: 'topik_exam', labelKey: 'testsPage.fields.topik_exam', topicCount: 10 },
  { id: 'business_korean', labelKey: 'testsPage.fields.business_korean', topicCount: 6 },
  { id: 'korean_culture', labelKey: 'testsPage.fields.korean_culture', topicCount: 6 },
  { id: 'english_skills', labelKey: 'testsPage.fields.english_skills', topicCount: 8 },
  { id: 'it_technology', labelKey: 'testsPage.fields.it_technology', topicCount: 8 },
  { id: 'business_finance', labelKey: 'testsPage.fields.business_finance', topicCount: 6 },
  { id: 'career_skills', labelKey: 'testsPage.fields.career_skills', topicCount: 8 },
];

export const TEST_FIELD_IDS = TEST_FIELDS.map((f) => f.id);
