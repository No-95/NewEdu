import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

const seedCourse = {
  slug: 'cam-nang-video-tieng-han-san-xuat',
  title: 'Cẩm nang Video: Tiếng Hàn Sản xuất',
  subtitle:
    'Khóa học tổng hợp 72 video hướng dẫn tiếng Hàn chuyên ngành sản xuất – từ từ vựng cơ bản đến giao tiếp thực tế tại nhà máy.',
  description: 'Danh sach hien co 72 video HLS da xu ly va upload len Cloudflare R2 bucket hdp1stcourse.',
  badge: '399.000 ₫',
  isFree: false,
  price: 399_000,
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
  price?: number;
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
    price: course.price ?? 399_000,
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
        price: seedCourse.price,
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
        price: seedCourse.price,
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

export const updateCoursePrice = mutation({
  args: {
    slug: v.string(),
    price: v.number(),
    badge: v.optional(v.string()),
  },
  returns: v.union(
    v.object({
      updated: v.literal(true),
      slug: v.string(),
      price: v.number(),
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

    await ctx.db.patch(course._id, {
      price: args.price,
      ...(args.badge !== undefined ? { badge: args.badge } : {}),
      updatedAt: Date.now(),
    });

    return { updated: true as const, slug: args.slug, price: args.price };
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
      price: v.number(),
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
      price: v.number(),
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
        price: v.number(),
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
        price: course.price ?? 399_000,
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

export const getCoursesByOwner = query({
  args: { email: v.string() },
  returns: v.array(
    v.object({
      _id: v.string(),
      slug: v.string(),
      title: v.string(),
      subtitle: v.string(),
      published: v.boolean(),
      price: v.number(),
      totalVideos: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email.trim().toLowerCase()))
      .first();
    if (!user) return [];

    const courses = await ctx.db
      .query('courses')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', user._id))
      .collect();

    return courses.map((course) => ({
      _id: course._id.toString(),
      slug: course.slug,
      title: course.title,
      subtitle: course.subtitle,
      published: course.published,
      price: course.price ?? 399_000,
      totalVideos: course.totalVideos,
    }));
  },
});

function slugifyTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export const createTeacherCourse = mutation({
  args: {
    email: v.string(),
    title: v.string(),
    subtitle: v.string(),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    published: v.boolean(),
  },
  returns: v.object({ courseId: v.string(), slug: v.string() }),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email.trim().toLowerCase()))
      .first();
    if (!user) throw new Error('User not found.');

    const now = Date.now();
    let slug = slugifyTitle(args.title) || `course-${now}`;
    const existing = await ctx.db
      .query('courses')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .first();
    if (existing) slug = `${slug}-${now}`;

    const courseId = await ctx.db.insert('courses', {
      slug,
      title: args.title.trim(),
      subtitle: args.subtitle.trim(),
      description: args.description?.trim() || '',
      badge: '',
      isFree: (args.price ?? 0) === 0,
      price: args.price ?? 0,
      teacherId: user.fullName || user.email,
      ownerId: user._id,
      totalVideos: 0,
      published: args.published,
      createdAt: now,
      updatedAt: now,
    });

    return { courseId: courseId.toString(), slug };
  },
});

export const updateTeacherCourse = mutation({
  args: {
    email: v.string(),
    courseId: v.id('courses'),
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    published: v.optional(v.boolean()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email.trim().toLowerCase()))
      .first();
    if (!user) throw new Error('User not found.');

    const course = await ctx.db.get(args.courseId);
    if (!course || course.ownerId !== user._id) throw new Error('Course not found.');

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) patch.title = args.title.trim();
    if (args.subtitle !== undefined) patch.subtitle = args.subtitle.trim();
    if (args.description !== undefined) patch.description = args.description.trim();
    if (args.price !== undefined) {
      patch.price = args.price;
      patch.isFree = args.price === 0;
    }
    if (args.published !== undefined) patch.published = args.published;

    await ctx.db.patch(args.courseId, patch);
    return { success: true };
  },
});
