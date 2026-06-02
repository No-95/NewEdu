import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

const seedCourse = {
  slug: 'cam-nang-video-tieng-han-san-xuat',
  title: 'Cẩm nang Video: Tiếng Hàn Sản xuất',
  subtitle:
    'Khóa học miễn phí tổng hợp 72 video hướng dẫn tiếng Hàn chuyên ngành sản xuất – từ từ vựng cơ bản đến giao tiếp thực tế tại nhà máy.',
  description: 'Danh sach hien co 72 video HLS da xu ly va upload len Cloudflare R2 bucket hdp1stcourse.',
  badge: '100% miễn phí',
  isFree: false,
  teacherId: 'hdp-teacher-team',
  // Unit 3, 6, 14 have 4 lectures; all other units have 5.
  lectureCounts: [5, 5, 4, 5, 5, 4, 5, 5, 5, 5, 5, 5, 5, 4, 5],
};

function mapCourse(course: {
  _id: { toString(): string };
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  isFree: boolean;
  teacherId: string;
  totalVideos: number;
  published: boolean;
  createdAt: number;
  updatedAt: number;
}, lectures: Array<{
  _id: { toString(): string };
  lectureNumber: number;
  title: string;
  description: string;
  classId: string;
  teacherId: string;
  videoFolderName: string;
  published: boolean;
  createdAt: number;
  updatedAt: number;
}>) {
  return {
    _id: course._id.toString(),
    slug: course.slug,
    title: course.title,
    subtitle: course.subtitle,
    description: course.description,
    badge: course.badge,
    isFree: course.isFree,
    teacherId: course.teacherId,
    totalVideos: course.totalVideos,
    published: course.published,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    lectures: lectures.map((lecture) => ({
      _id: lecture._id.toString(),
      lectureNumber: lecture.lectureNumber,
      title: lecture.title,
      description: lecture.description,
      classId: lecture.classId,
      teacherId: lecture.teacherId,
      videoFolderName: lecture.videoFolderName,
      published: lecture.published,
      createdAt: lecture.createdAt,
      updatedAt: lecture.updatedAt,
    })),
  };
}

export const seedCourseCatalog = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const now = Date.now();
    const totalVideos = seedCourse.lectureCounts.reduce((sum, count) => sum + count, 0);
    const existingCourse = await ctx.db.query('courses').withIndex('by_slug', (q) => q.eq('slug', seedCourse.slug)).first();

    let courseId;
    if (existingCourse) {
      courseId = existingCourse._id;
      await ctx.db.patch(existingCourse._id, {
        title: seedCourse.title,
        subtitle: seedCourse.subtitle,
        description: seedCourse.description,
        badge: seedCourse.badge,
        isFree: seedCourse.isFree,
        teacherId: seedCourse.teacherId,
        totalVideos,
        published: true,
        updatedAt: now,
      });

      const existingLectures = await ctx.db
        .query('courseLectures')
        .withIndex('by_courseId', (q) => q.eq('courseId', existingCourse._id))
        .collect();
      await Promise.all(existingLectures.map((lecture) => ctx.db.delete(lecture._id)));
    } else {
      courseId = await ctx.db.insert('courses', {
        slug: seedCourse.slug,
        title: seedCourse.title,
        subtitle: seedCourse.subtitle,
        description: seedCourse.description,
        badge: seedCourse.badge,
        isFree: seedCourse.isFree,
        teacherId: seedCourse.teacherId,
        totalVideos,
        published: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    let lectureNumber = 1;
    for (let unit = 1; unit <= seedCourse.lectureCounts.length; unit += 1) {
      const lecturesInUnit = seedCourse.lectureCounts[unit - 1];

      for (let lecture = 1; lecture <= lecturesInUnit; lecture += 1) {
        await ctx.db.insert('courseLectures', {
          courseId,
          lectureNumber,
          title: `Unit ${unit} - Lecture ${lecture}`,
          description: 'Bai hoc tieng Han chuyen nganh san xuat voi noi dung ung dung thuc te tai nha may.',
          classId: seedCourse.slug,
          teacherId: seedCourse.teacherId,
          videoFolderName: `${unit}-${lecture}`,
          published: true,
          createdAt: now,
          updatedAt: now,
        });

        lectureNumber += 1;
      }
    }

    return null;
  },
});

export const getPublishedCourses = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.string(),
      slug: v.string(),
      title: v.string(),
      subtitle: v.string(),
      description: v.string(),
      badge: v.string(),
      isFree: v.boolean(),
      teacherId: v.string(),
      totalVideos: v.number(),
      published: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
      lectures: v.array(
        v.object({
          _id: v.string(),
          lectureNumber: v.number(),
          title: v.string(),
          description: v.string(),
          classId: v.string(),
          teacherId: v.string(),
          videoFolderName: v.string(),
          published: v.boolean(),
          createdAt: v.number(),
          updatedAt: v.number(),
        })
      ),
    })
  ),
  handler: async (ctx) => {
    const courses = await ctx.db.query('courses').withIndex('by_published', (q) => q.eq('published', true)).collect();

    const result = [] as ReturnType<typeof mapCourse>[];
    for (const course of courses) {
      const lectures = await ctx.db
        .query('courseLectures')
        .withIndex('by_courseId_lectureNumber', (q) => q.eq('courseId', course._id))
        .order('asc')
        .collect();
      result.push(mapCourse(course, lectures));
    }

    return result;
  },
});

export const getCourseBySlug = query({
  args: {
    slug: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.string(),
      slug: v.string(),
      title: v.string(),
      subtitle: v.string(),
      description: v.string(),
      badge: v.string(),
      isFree: v.boolean(),
      teacherId: v.string(),
      totalVideos: v.number(),
      published: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
      lectures: v.array(
        v.object({
          _id: v.string(),
          lectureNumber: v.number(),
          title: v.string(),
          description: v.string(),
          classId: v.string(),
          teacherId: v.string(),
          videoFolderName: v.string(),
          published: v.boolean(),
          createdAt: v.number(),
          updatedAt: v.number(),
        })
      ),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const course = await ctx.db
      .query('courses')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();

    if (!course) {
      return null;
    }

    const lectures = await ctx.db
      .query('courseLectures')
      .withIndex('by_courseId_lectureNumber', (q) => q.eq('courseId', course._id))
      .order('asc')
      .collect();

    return mapCourse(course, lectures);
  },
});

export const getLectureByCourseAndVideoId = query({
  args: {
    slug: v.string(),
    videoId: v.string(),
  },
  returns: v.union(
    v.object({
      course: v.object({
        _id: v.string(),
        slug: v.string(),
        title: v.string(),
        subtitle: v.string(),
        description: v.string(),
        badge: v.string(),
        isFree: v.boolean(),
        teacherId: v.string(),
        totalVideos: v.number(),
        published: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
      }),
      lecture: v.object({
        _id: v.string(),
        lectureNumber: v.number(),
        title: v.string(),
        description: v.string(),
        classId: v.string(),
        teacherId: v.string(),
        videoFolderName: v.string(),
        published: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
      }),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const course = await ctx.db
      .query('courses')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();

    if (!course) {
      return null;
    }

    const lecture = await ctx.db
      .query('courseLectures')
      .withIndex('by_courseId_lectureNumber', (q) => q.eq('courseId', course._id))
      .filter((q) => q.eq(q.field('videoFolderName'), args.videoId))
      .first();

    if (!lecture) {
      return null;
    }

    return {
      course: {
        _id: course._id.toString(),
        slug: course.slug,
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        badge: course.badge,
        isFree: course.isFree,
        teacherId: course.teacherId,
        totalVideos: course.totalVideos,
        published: course.published,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      },
      lecture: {
        _id: lecture._id.toString(),
        lectureNumber: lecture.lectureNumber,
        title: lecture.title,
        description: lecture.description,
        classId: lecture.classId,
        teacherId: lecture.teacherId,
        videoFolderName: lecture.videoFolderName,
        published: lecture.published,
        createdAt: lecture.createdAt,
        updatedAt: lecture.updatedAt,
      },
    };
  },
});
