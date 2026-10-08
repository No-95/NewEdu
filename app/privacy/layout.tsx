import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Chính sách Bảo mật — HDP EDU",
  description: "Chính sách bảo mật của HDP EDU: dữ liệu chúng tôi thu thập, cách sử dụng, cookies, quyền của người dùng và bảo mật thông tin.",
  alternates: { canonical: 'https://hdpedu.com/privacy' },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
