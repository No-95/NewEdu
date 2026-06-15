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
    hdpId: v.optional(v.string()),
    onboardingCompletedAt: v.optional(v.number()),
    onboardingVersion: v.optional(v.number()),
    onboardingRequired: v.optional(v.boolean()),
    activeRole: v.optional(v.string()),
  })
    .index('by_email', ['email'])
    .index('by_role', ['role'])
    .index('by_hdpId', ['hdpId']),

  hdpIdSequences: defineTable({
    name: v.literal('default'),
    lastValue: v.number(),
  }).index('by_name', ['name']),

  userOnboarding: defineTable({
    userId: v.id('users'),
    version: v.number(),
    roles: v.array(v.string()),
    goals: v.array(v.string()),
    goalOtherText: v.optional(v.string()),
    industries: v.array(v.string()),
    industryOtherText: v.optional(v.string()),
    learnerStage: v.optional(v.string()),
    jobSeekerStage: v.optional(v.string()),
    employerStage: v.optional(v.string()),
    marketingInterests: v.array(v.string()),
    submittedAt: v.number(),
  }).index('by_userId', ['userId']),

  userRoleProfiles: defineTable({
    userId: v.id('users'),
    roleKey: v.string(),
    stageKey: v.optional(v.string()),
    headline: v.optional(v.string()),
    bio: v.optional(v.string()),
    companyName: v.optional(v.string()),
    experienceSummary: v.optional(v.string()),
    enabled: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_userId_roleKey', ['userId', 'roleKey']),

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
    price: v.optional(v.number()),
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

  transactions: defineTable({
    userId: v.id('users'),
    type: v.union(v.literal('deposit'), v.literal('purchase')),
    amount: v.number(),
    description: v.string(),
    createdAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_userId_createdAt', ['userId', 'createdAt']),

  purchases: defineTable({
    userId: v.string(),
    courseId: v.string(),
    provider: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.union(v.literal('pending'), v.literal('active'), v.literal('failed')),
    metadata: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_user_course', ['userId', 'courseId'])
    .index('by_course_user', ['courseId', 'userId']),

  homeworks: defineTable({
    assignedTo: v.id('users'),
    assignedBy: v.optional(v.id('users')),
    courseId: v.optional(v.id('courses')),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal('pending'), v.literal('in-progress'), v.literal('completed')),
    dueDate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_assignedTo', ['assignedTo'])
    .index('by_status', ['status']),

  userCourseProgress: defineTable({
    userId: v.id('users'),
    courseId: v.id('courses'),
    completedLectures: v.number(),
    totalLectures: v.number(),
    lastUpdated: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_user_course', ['userId', 'courseId']),

  liveClassrooms: defineTable({
    roomID: v.string(),
    title: v.string(),
    hostName: v.string(),
    roomPassword: v.optional(v.string()),
    status: v.union(v.literal('live'), v.literal('ended')),
    startedAt: v.number(),
    lastActiveAt: v.number(),
  })
    .index('by_roomID', ['roomID'])
    .index('by_status_lastActiveAt', ['status', 'lastActiveAt']),

  bookOrders: defineTable({
    fullName: v.string(),
    phone: v.string(),
    address: v.string(),
    note: v.optional(v.string()),
    userId: v.optional(v.string()),
    courseId: v.optional(v.string()),
    source: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_createdAt', ['createdAt'])
    .index('by_phone', ['phone'])
    .index('by_user_course', ['userId', 'courseId'])
    .index('by_userId_source', ['userId', 'source']),

  supportDailyUsage: defineTable({
    identifier: v.string(),
    dateKey: v.string(),
    count: v.number(),
    updatedAt: v.number(),
  })
    .index('by_identifier_dateKey', ['identifier', 'dateKey'])
    .index('by_dateKey', ['dateKey']),

  hrEmployees: defineTable({
    ownerId: v.id('users'),
    name: v.string(),
    department: v.string(),
    role: v.string(),
    joinDate: v.string(),
    status: v.union(v.literal('active'), v.literal('on_leave')),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_ownerId', ['ownerId']),

  hrDepartments: defineTable({
    ownerId: v.id('users'),
    name: v.string(),
    head: v.string(),
    employees: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_ownerId', ['ownerId']),

  hrReviews: defineTable({
    ownerId: v.id('users'),
    employee: v.string(),
    period: v.string(),
    rating: v.number(),
    status: v.union(v.literal('draft'), v.literal('completed')),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_ownerId', ['ownerId']),

  internalCourses: defineTable({
    ownerId: v.id('users'),
    title: v.string(),
    enrolled: v.number(),
    completed: v.number(),
    compliance: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_ownerId', ['ownerId']),

  internalEmployeeProgress: defineTable({
    ownerId: v.id('users'),
    employeeName: v.string(),
    progress: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_ownerId', ['ownerId']),

  trainingStudents: defineTable({
    ownerId: v.id('users'),
    name: v.string(),
    email: v.string(),
    className: v.string(),
    status: v.union(v.literal('active'), v.literal('inactive'), v.literal('graduated')),
    attendanceRate: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_ownerId', ['ownerId']),

  trainingTeachers: defineTable({
    ownerId: v.id('users'),
    name: v.string(),
    subject: v.string(),
    classes: v.number(),
    students: v.number(),
    status: v.union(v.literal('active'), v.literal('on_leave')),
    rating: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_ownerId', ['ownerId']),

  trainingClasses: defineTable({
    ownerId: v.id('users'),
    name: v.string(),
    teacher: v.string(),
    schedule: v.string(),
    students: v.number(),
    capacity: v.number(),
    completionRate: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_ownerId', ['ownerId']),

  crmLeads: defineTable({
    ownerId: v.id('users'),
    name: v.string(),
    phone: v.string(),
    source: v.string(),
    stage: v.union(
      v.literal('new_lead'),
      v.literal('contacted'),
      v.literal('interested'),
      v.literal('trial_class'),
      v.literal('enrolled')
    ),
    followUpDate: v.string(),
    notes: v.string(),
    revenueAmount: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_ownerId', ['ownerId']),

  businessPartners: defineTable({
    ownerId: v.id('users'),
    name: v.string(),
    type: v.string(),
    referrals: v.number(),
    revenue: v.string(),
    commission: v.string(),
    status: v.union(v.literal('active'), v.literal('pending')),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_ownerId', ['ownerId']),

  businessReferrals: defineTable({
    ownerId: v.id('users'),
    partner: v.string(),
    student: v.string(),
    date: v.string(),
    amount: v.string(),
    amountValue: v.optional(v.number()),
    status: v.union(v.literal('converted'), v.literal('pending')),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_ownerId', ['ownerId']),

  businessRevenuePoints: defineTable({
    ownerId: v.id('users'),
    label: v.string(),
    value: v.number(),
    createdAt: v.number(),
  }).index('by_ownerId', ['ownerId']),

  studentGrowthPoints: defineTable({
    ownerId: v.id('users'),
    label: v.string(),
    value: v.number(),
    createdAt: v.number(),
  }).index('by_ownerId', ['ownerId']),

  careerProfiles: defineTable({
    userId: v.id('users'),
    location: v.optional(v.string()),
    education: v.array(
      v.object({
        school: v.string(),
        degree: v.string(),
        year: v.string(),
      })
    ),
    skills: v.array(
      v.object({
        name: v.string(),
        level: v.number(),
      })
    ),
    certificates: v.array(
      v.object({
        name: v.string(),
        issuer: v.string(),
        year: v.string(),
      })
    ),
    experience: v.array(
      v.object({
        company: v.string(),
        role: v.string(),
        period: v.string(),
        description: v.string(),
      })
    ),
    languages: v.array(
      v.object({
        name: v.string(),
        level: v.string(),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_userId', ['userId']),

  recruitmentJobPostings: defineTable({
    ownerId: v.id('users'),
    title: v.string(),
    department: v.string(),
    applicants: v.number(),
    status: v.union(v.literal('open'), v.literal('closed'), v.literal('draft')),
    postedAt: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_ownerId', ['ownerId']),

  recruitmentCandidates: defineTable({
    ownerId: v.id('users'),
    name: v.string(),
    position: v.string(),
    stage: v.union(
      v.literal('applied'),
      v.literal('screening'),
      v.literal('interview'),
      v.literal('offer'),
      v.literal('rejected')
    ),
    score: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_ownerId', ['ownerId']),
});
