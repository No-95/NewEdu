import { BooksPageClient } from '@/components/books/BooksPageClient';
import type { Metadata } from 'next';

export default function BooksPage() {
  return <BooksPageClient />;
}

export const metadata: Metadata = {
  title: "Sách Tiếng Hàn Sản xuất cho người đi làm",
  description: "Sách Tiếng Hàn Sản xuất 225.000₫ — từ vựng và mẫu câu dùng ngay tại nhà máy, công xưởng Hàn Quốc. Giao toàn quốc, dùng kèm khoá video 72 bài.",
  alternates: { canonical: 'https://hdpedu.com/books' },
  robots: { index: true, follow: true },
}
