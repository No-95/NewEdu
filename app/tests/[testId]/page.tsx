import type { Metadata } from 'next';

import { TestTakeClient } from '@/components/tests/TestTakeClient';
import { api } from '@/convex/_generated/api';
import { buildMetadata, seoQuery } from '@/lib/seo';

type PageProps = {
  params: Promise<{ testId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { testId } = await params;
  const payload = await seoQuery((convex) =>
    convex.query(api.tests.getPublishedTestByExternalId, { externalId: testId }),
  );

  if (!payload) {
    return buildMetadata({
      title: 'Bài kiểm tra Tiếng Hàn Sản xuất',
      description:
        'Bài kiểm tra trình độ tiếng Hàn sản xuất miễn phí trên HDP EDU. Biết ngay điểm mạnh, điểm yếu và lộ trình học phù hợp.',
      path: `/tests/${testId}`,
      index: false,
    });
  }

  const { test } = payload;
  return buildMetadata({
    title: test.title,
    description:
      test.description ||
      `Bài kiểm tra ${test.title}: ${test.questionCount} câu, ${test.durationMinutes} phút. Làm miễn phí trên HDP EDU và nhận kết quả ngay.`,
    path: `/tests/${testId}`,
  });
}

export default async function TestTakePage({ params }: PageProps) {
  const { testId } = await params;
  return <TestTakeClient testId={testId} />;
}
