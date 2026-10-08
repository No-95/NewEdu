import { CoursesCatalogClient } from '@/components/courses/CoursesCatalogClient';
import type { Metadata } from 'next';

export default async function CoursesPage() {
  return <CoursesCatalogClient />;
}

export const metadata: Metadata = {
  title: "Khóa học Tiếng Hàn Sản xuất — 72 bài giảng",
  description: "Khóa video Tiếng Hàn Sản xuất 72 bài, 15 unit — 399.000₫. Từ vựng và mẫu câu dùng ngay tại nhà máy, công xưởng Hàn Quốc. Học trọn đời.",
  alternates: { canonical: 'https://hdpedu.com/courses' },
  robots: { index: true, follow: true },
}
