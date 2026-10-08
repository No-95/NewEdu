import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Đăng nhập / Đăng ký",
  description: "Đăng nhập hoặc tạo tài khoản HDP EDU để học khoá tiếng Hàn sản xuất, làm bài kiểm tra và theo dõi tiến độ.",
  alternates: { canonical: 'https://hdpedu.com/auth' },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
