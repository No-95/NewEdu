import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Lớp học trực tuyến",
  description: "Phòng học trực tuyến HDP EDU: tham gia lớp, xem bài giảng và tương tác với giáo viên, học viên.",
  alternates: { canonical: 'https://hdpedu.com/courses/classroom' },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
