import type { Metadata } from 'next';

import { CourseVideoClient } from '@/components/courses/CourseVideoClient';
import { api } from '@/convex/_generated/api';
import { buildMetadata, seoQuery } from '@/lib/seo';

type PageProps = {
  params: Promise<{ courseId: string; videoId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseId, videoId } = await params;
  const result = await seoQuery((convex) =>
    convex.query(api.courses.getLectureByCourseAndVideoId, { slug: courseId, videoId }),
  );

  if (!result) {
    return buildMetadata({
      title: 'Bài giảng Tiếng Hàn Sản xuất',
      description:
        'Bài giảng video tiếng Hàn sản xuất: từ vựng và mẫu câu giao tiếp thực tế tại nhà máy, công xưởng Hàn Quốc.',
      path: `/courses/${courseId}/${videoId}`,
      index: false,
    });
  }

  const { course, lecture } = result;
  return buildMetadata({
    title: `${lecture.title} — ${course.title}`,
    description: lecture.description || course.subtitle,
    path: `/courses/${courseId}/${videoId}`,
    index: false,
  });
}

export default async function CourseVideoPage({ params }: PageProps) {
  const { courseId, videoId } = await params;
  return <CourseVideoClient courseSlug={courseId} videoId={videoId} />;
}
