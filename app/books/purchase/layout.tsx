import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Mua sách Tiếng Hàn Sản xuất",
  description: "Đặt mua sách Tiếng Hàn Sản xuất 225.000₫. Điền thông tin giao hàng và thanh toán an toàn trên HDP EDU.",
  alternates: { canonical: 'https://hdpedu.com/books/purchase' },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
