import { DashboardClient } from '@/components/dashboard/DashboardClient';
import type { Metadata } from 'next';

export default function DashboardPage() {
  return <DashboardClient />;
}

export const metadata: Metadata = {
  title: "Bảng điều khiển",
  description: "Bảng điều khiển HDP EDU: tiến độ học, khoá học đã mua, bài kiểm tra và hoạt động tài khoản của bạn.",
  alternates: { canonical: 'https://hdpedu.com/dashboard' },
  robots: { index: false, follow: false },
}
