import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Điều khoản Dịch vụ — HDP EDU",
  description: "Điều khoản dịch vụ của HDP EDU: tài khoản, thanh toán, chính sách hoàn tiền 7 ngày, sở hữu trí tuệ và quyền của người dùng.",
  alternates: { canonical: 'https://hdpedu.com/terms' },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
