import { Suspense } from 'react';
import type { Metadata } from 'next';

import { CourseDetailClient } from '@/components/courses/CourseDetailClient';
import { api } from '@/convex/_generated/api';
import { buildMetadata, clampText, seoQuery } from '@/lib/seo';

type PageProps = {
  params: Promise<{ courseId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseId } = await params;
  const course = await seoQuery((convex) =>
    convex.query(api.courses.getCourseBySlug, { slug: courseId }),
  );

  if (!course) {
    return buildMetadata({
      title: 'Khóa học Tiếng Hàn Sản xuất',
      description:
        'Khóa học video tiếng Hàn sản xuất cho người làm việc tại nhà máy, công xưởng Hàn Quốc. Học trọn đời trên HDP EDU.',
      path: `/courses/${courseId}`,
    });
  }

  return buildMetadata({
    title: course.title,
    description: course.subtitle || course.description,
    path: `/courses/${courseId}`,
  });
}

export default async function CourseDetailsPage({ params }: PageProps) {
  const { courseId } = await params;
  return (
    <Suspense fallback={null}>
      <CourseDetailClient courseSlug={courseId} />
    </Suspense>
  );
}
