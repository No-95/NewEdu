import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Đăng ký làm giáo viên",
  description: "Gửi đơn đăng ký trở thành giáo viên HDP EDU và tham gia giảng dạy tiếng Hàn sản xuất cho người lao động Việt.",
  alternates: { canonical: 'https://hdpedu.com/teacher-applicant' },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
