import type { Metadata } from 'next';

// Trang xem trước nội bộ — không cho công cụ tìm kiếm lập chỉ mục.
export const metadata: Metadata = {
  title: 'Xem trước: Testimonials',
  robots: { index: false, follow: false },
};

export default function PreviewTestimonialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
