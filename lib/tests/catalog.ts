import type { TestItem } from './types';

export function getTestDisplayTitle(
  test: Pick<TestItem, 'fieldId' | 'topicIndex' | 'variant' | 'title'>,
  t: (key: string, options?: { params?: Record<string, string | number> }) => string
): string {
  if (test.title && !test.title.includes('·')) {
    return test.title;
  }
  const field = t(`testsPage.fields.${test.fieldId}`);
  const topic = t(`testsPage.topicTemplates.${test.topicIndex}`);
  return t('testsPage.titlePattern', { params: { field, topic, variant: test.variant } });
}

export function getTestDescriptionKey(test: Pick<TestItem, 'difficulty'>): string {
  return `testsPage.descriptions.${test.difficulty}`;
}

export function getSourceLabelKey(source: TestItem['source']): string {
  return `testsPage.source.${source}`;
}
