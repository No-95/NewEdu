import { CourseVideoClient } from '@/components/courses/CourseVideoClient';

export default async function CourseVideoPage({
  params,
}: {
  params: Promise<{ courseId: string; videoId: string }>;
}) {
  const { courseId, videoId } = await params;
  return <CourseVideoClient courseSlug={courseId} videoId={videoId} />;
}
