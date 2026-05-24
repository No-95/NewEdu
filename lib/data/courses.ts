import { lectureMetadataSchema, type LectureMetadata } from '@/lib/models/lecture';
import { compareVideoFolderNames } from '@/lib/courses/outline';

export interface CourseMetadata {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  teacherId: string;
  isFree: boolean;
  lectures: LectureMetadata[];
}

export const FIRST_COURSE_ID = 'cam-nang-video-tieng-han-san-xuat';
const FIRST_COURSE_TEACHER_ID = 'hdp-teacher-team';

const firstCourseUnitLectureCounts = [
  { unit: 1, lectures: 5 },
  { unit: 2, lectures: 5 },
  { unit: 3, lectures: 5 },
  { unit: 4, lectures: 5 },
  { unit: 5, lectures: 5 },
  { unit: 6, lectures: 5 },
  { unit: 7, lectures: 5 },
  { unit: 8, lectures: 5 },
  { unit: 9, lectures: 5 },
  { unit: 10, lectures: 5 },
  { unit: 11, lectures: 5 },
  { unit: 12, lectures: 5 },
  { unit: 13, lectures: 4 },
  { unit: 14, lectures: 4 },
  { unit: 15, lectures: 4 },
] as const;

const firstCourseLectures: LectureMetadata[] = firstCourseUnitLectureCounts
  .flatMap(({ unit, lectures }) =>
    Array.from({ length: lectures }, (_, lectureIndex) => {
      const lecture = lectureIndex + 1;
      const videoFolderName = `${unit}-${lecture}`;

      return lectureMetadataSchema.parse({
        id: videoFolderName,
        title: `Unit ${unit} - Lecture ${lecture}`,
        description:
          'Bai hoc tieng Han chuyen nganh san xuat voi noi dung ung dung thuc te tai nha may.',
        classId: FIRST_COURSE_ID,
        teacherId: FIRST_COURSE_TEACHER_ID,
        videoFolderName,
      });
    })
  )
  .sort((left, right) => compareVideoFolderNames(left.videoFolderName, right.videoFolderName));

export const courses: CourseMetadata[] = [
  {
    id: FIRST_COURSE_ID,
    title: 'Cẩm nang Video: Tiếng Hàn Sản xuất',
    subtitle:
      'Khóa học miễn phí tổng hợp 75 video hướng dẫn tiếng Hàn chuyên ngành sản xuất – từ từ vựng cơ bản đến giao tiếp thực tế tại nhà máy.',
    description:
      'Danh sach hien co 72 video HLS da xu ly va upload len Cloudflare R2 bucket hdp1stcourse.',
    badge: '100% miễn phí',
    teacherId: FIRST_COURSE_TEACHER_ID,
    isFree: true,
    lectures: firstCourseLectures,
  },
];

export function getCourseById(courseId: string): CourseMetadata | undefined {
  return courses.find((course) => course.id === courseId);
}

export function getLectureById(courseId: string, videoId: string): LectureMetadata | undefined {
  const course = getCourseById(courseId);

  return course?.lectures.find((lecture) => lecture.id === videoId);
}
