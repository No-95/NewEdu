import { TestTakeClient } from '@/components/tests/TestTakeClient';

export default async function TestTakePage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;
  return <TestTakeClient testId={testId} />;
}
