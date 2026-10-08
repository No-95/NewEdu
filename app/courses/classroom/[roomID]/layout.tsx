import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Phòng học",
  description: "Phòng học trực tuyến HDP EDU: bài giảng, tài liệu và trao đổi trong lớp.",
  alternates: { canonical: 'https://hdpedu.com/courses/classroom/[roomID]' },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
