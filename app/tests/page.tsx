import { TestsCatalogClient } from '@/components/tests/TestsCatalogClient';
import type { Metadata } from 'next';

export default function TestsPage() {
  return <TestsCatalogClient />;
}

export const metadata: Metadata = {
  title: "Kiểm tra trình độ Tiếng Hàn Sản xuất (miễn phí)",
  description: "Làm bài kiểm tra trình độ tiếng Hàn sản xuất miễn phí trên HDP EDU. Biết ngay điểm mạnh, điểm yếu và lộ trình học phù hợp.",
  alternates: { canonical: 'https://hdpedu.com/tests' },
  robots: { index: true, follow: true },
}
