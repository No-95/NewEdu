import { ExpertEventsClient } from '@/components/ecosystem/experts/ExpertEventsClient';
import type { Metadata } from 'next';

export default function ExpertEventsPage() {
  return <ExpertEventsClient />;
}

export const metadata: Metadata = {
  title: "Sự kiện chuyên gia HDP EDU",
  description: "Lịch sự kiện, hội thảo và buổi chia sẻ của mạng lưới chuyên gia HDP EDU dành cho người học và doanh nghiệp.",
  alternates: { canonical: 'https://hdpedu.com/experts/events' },
  robots: { index: true, follow: true },
}
