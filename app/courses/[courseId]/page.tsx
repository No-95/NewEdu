import { CourseDetailClient } from '@/components/courses/CourseDetailClient';

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <CourseDetailClient courseSlug={courseId} />;
}
