import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    email: v.string(),
    fullName: v.optional(v.string()),
    username: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    agreeToTerms: v.optional(v.boolean()),
    emailVerified: v.optional(v.boolean()),
    role: v.string(),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    balance: v.optional(v.number()),
  })
    .index('by_email', ['email'])
    .index('by_role', ['role']),

  otpSessions: defineTable({
    email: v.string(),
    otpHash: v.string(),
    expiresAt: v.number(),
    consumedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index('by_email', ['email'])
    .index('by_email_expiresAt', ['email', 'expiresAt']),

  contactSubmissions: defineTable({
    fullName: v.string(),
    email: v.string(),
    phone: v.string(),
    organization: v.optional(v.string()),
    role: v.optional(v.string()),
    feedback: v.string(),
    status: v.union(v.literal('new'), v.literal('in_review'), v.literal('resolved')),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_email', ['email'])
    .index('by_status', ['status'])
    .index('by_createdAt', ['createdAt']),

  teacherApplications: defineTable({
    fullName: v.string(),
    email: v.string(),
    phone: v.string(),
    experienceYears: v.string(),
    specialization: v.string(),
    certifications: v.optional(v.string()),
    nativeLanguage: v.string(),
    hoursAvailable: v.string(),
    bio: v.string(),
    status: v.union(
      v.literal('submitted'),
      v.literal('in_review'),
      v.literal('shortlisted'),
      v.literal('rejected'),
      v.literal('accepted')
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_email', ['email'])
    .index('by_status', ['status'])
    .index('by_createdAt', ['createdAt']),

  courses: defineTable({
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
  })
    .index('by_slug', ['slug'])
    .index('by_published', ['published'])
    .index('by_createdAt', ['createdAt']),

  courseLectures: defineTable({
    courseId: v.id('courses'),
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
    .index('by_courseId', ['courseId'])
    .index('by_courseId_lectureNumber', ['courseId', 'lectureNumber'])
    .index('by_videoFolderName', ['videoFolderName']),

  communityPosts: defineTable({
    authorId: v.optional(v.id('users')),
    authorName: v.string(),
    authorHandle: v.string(),
    authorAvatar: v.string(),
    content: v.string(),
    mediaType: v.union(v.literal('none'), v.literal('image'), v.literal('video')),
    mediaUrl: v.optional(v.string()),
    tag: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    likesCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_authorId', ['authorId'])
    .index('by_createdAt', ['createdAt']),

  communityComments: defineTable({
    postId: v.id('communityPosts'),
    authorId: v.optional(v.id('users')),
    authorName: v.string(),
    content: v.string(),
    createdAt: v.number(),
  })
    .index('by_postId', ['postId'])
    .index('by_authorId', ['authorId'])
    .index('by_createdAt', ['createdAt']),
});
