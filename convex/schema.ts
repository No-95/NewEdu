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
    emailNotificationsEnabled: v.optional(v.boolean()),
    preferredLocale: v.optional(v.union(v.literal('en'), v.literal('vi'), v.literal('ko'))),
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
    ownerId: v.optional(v.id('users')),
    totalVideos: v.number(),
    published: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_published', ['published'])
    .index('by_ownerId', ['ownerId'])
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
    learnerNote: v.optional(v.string()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_assignedTo', ['assignedTo'])
    .index('by_assignedBy', ['assignedBy'])
    .index('by_status', ['status']),

  teacherResources: defineTable({
    ownerId: v.id('users'),
    title: v.string(),
    fileName: v.string(),
    mimeType: v.optional(v.string()),
    storageId: v.optional(v.id('_storage')),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_ownerId', ['ownerId']),

  userCourseProgress: defineTable({
    userId: v.id('users'),
    courseId: v.id('courses'),
    completedLectures: v.number(),
    totalLectures: v.number(),
    lastVideoId: v.optional(v.string()),
    lastWatchedAt: v.optional(v.number()),
    lastUpdated: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_user_course', ['userId', 'courseId']),

  liveClassrooms: defineTable({
    roomID: v.string(),
    title: v.string(),
    hostName: v.string(),
    hostUserId: v.optional(v.id('users')),
    roomPassword: v.optional(v.string()),
    status: v.union(v.literal('live'), v.literal('ended')),
    startedAt: v.number(),
    lastActiveAt: v.number(),
  })
    .index('by_roomID', ['roomID'])
    .index('by_status_lastActiveAt', ['status', 'lastActiveAt'])
    .index('by_hostUserId', ['hostUserId']),

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
    email: v.optional(v.string()),
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
    platformCourseSlug: v.optional(v.string()),
    employeeId: v.optional(v.id('hrEmployees')),
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
    email: v.optional(v.string()),
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
        storageId: v.optional(v.id('_storage')),
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
    cvStorageId: v.optional(v.id('_storage')),
    cvParseStatus: v.optional(
      v.union(
        v.literal('idle'),
        v.literal('parsing'),
        v.literal('ready'),
        v.literal('failed')
      )
    ),
    cvParsedAt: v.optional(v.number()),
    cvParseError: v.optional(v.string()),
    cvExtractedDraft: v.optional(
      v.object({
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
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_userId', ['userId']),

  expertProfiles: defineTable({
    userId: v.id('users'),
    displayName: v.string(),
    headline: v.string(),
    bio: v.optional(v.string()),
    industries: v.array(v.string()),
    expertise: v.array(v.string()),
    published: v.boolean(),
    verified: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_published', ['published']),

  expertConsultationRequests: defineTable({
    expertUserId: v.id('users'),
    requesterUserId: v.id('users'),
    topic: v.string(),
    message: v.string(),
    status: v.union(v.literal('new'), v.literal('accepted'), v.literal('closed')),
    scheduledStart: v.optional(v.number()),
    scheduledEnd: v.optional(v.number()),
    meetingUrl: v.optional(v.string()),
    timezone: v.optional(v.string()),
    reminderSentAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_expertUserId', ['expertUserId'])
    .index('by_requesterUserId', ['requesterUserId']),

  expertApplications: defineTable({
    fullName: v.string(),
    email: v.string(),
    phone: v.string(),
    specialization: v.string(),
    bio: v.string(),
    status: v.union(
      v.literal('submitted'),
      v.literal('in_review'),
      v.literal('accepted'),
      v.literal('rejected')
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_email', ['email'])
    .index('by_status', ['status']),

  recruitmentJobPostings: defineTable({
    ownerId: v.id('users'),
    externalId: v.string(),
    title: v.string(),
    department: v.string(),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
    salary: v.optional(v.string()),
    applicants: v.number(),
    status: v.union(v.literal('open'), v.literal('closed'), v.literal('draft')),
    postedAt: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_ownerId', ['ownerId'])
    .index('by_externalId', ['externalId'])
    .index('by_status', ['status']),

  recruitmentCandidates: defineTable({
    ownerId: v.id('users'),
    jobPostingId: v.optional(v.id('recruitmentJobPostings')),
    applicantUserId: v.optional(v.id('users')),
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
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_ownerId', ['ownerId'])
    .index('by_applicantUserId', ['applicantUserId'])
    .index('by_jobPostingId', ['jobPostingId']),

  recruitmentStageEvents: defineTable({
    candidateId: v.id('recruitmentCandidates'),
    fromStage: v.optional(
      v.union(
        v.literal('applied'),
        v.literal('screening'),
        v.literal('interview'),
        v.literal('offer'),
        v.literal('rejected')
      )
    ),
    toStage: v.union(
      v.literal('applied'),
      v.literal('screening'),
      v.literal('interview'),
      v.literal('offer'),
      v.literal('rejected')
    ),
    actorUserId: v.optional(v.id('users')),
    createdAt: v.number(),
  }).index('by_candidateId_createdAt', ['candidateId', 'createdAt']),

  forumPosts: defineTable({
    authorId: v.id('users'),
    authorName: v.string(),
    title: v.string(),
    body: v.string(),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_createdAt', ['createdAt']),

  newsArticles: defineTable({
    slug: v.string(),
    title: v.string(),
    excerpt: v.string(),
    body: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    coverImage: v.optional(v.string()),
    authorId: v.id('users'),
    authorName: v.string(),
    published: v.boolean(),
    publishedAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_published_publishedAt', ['published', 'publishedAt']),

  tests: defineTable({
    externalId: v.string(),
    fieldId: v.string(),
    title: v.string(),
    topicIndex: v.number(),
    variant: v.number(),
    difficulty: v.union(v.literal('beginner'), v.literal('intermediate'), v.literal('advanced')),
    durationMinutes: v.number(),
    questionCount: v.number(),
    typedQuestionCount: v.number(),
    mcqCount: v.number(),
    published: v.boolean(),
    source: v.union(v.literal('curated'), v.literal('ai_generated'), v.literal('template')),
    featured: v.boolean(),
    popularity: v.number(),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_externalId', ['externalId'])
    .index('by_published', ['published'])
    .index('by_published_fieldId', ['published', 'fieldId']),

  testQuestions: defineTable({
    testId: v.id('tests'),
    order: v.number(),
    type: v.union(
      v.literal('multiple_choice'),
      v.literal('fill_blank'),
      v.literal('short_answer'),
      v.literal('translation'),
      v.literal('sentence_order'),
      v.literal('reading_comprehension')
    ),
    prompt: v.string(),
    passage: v.optional(v.string()),
    options: v.optional(v.array(v.string())),
    correctIndex: v.optional(v.number()),
    modelAnswer: v.string(),
    rubric: v.string(),
    explanation: v.optional(v.string()),
    acceptableVariants: v.optional(v.array(v.string())),
    maxLength: v.optional(v.number()),
  }).index('by_testId_order', ['testId', 'order']),

  testAttempts: defineTable({
    userId: v.optional(v.id('users')),
    email: v.optional(v.string()),
    testId: v.id('tests'),
    startedAt: v.number(),
    submittedAt: v.optional(v.number()),
    score: v.optional(v.number()),
    maxScore: v.number(),
    status: v.union(v.literal('in_progress'), v.literal('submitted'), v.literal('grading')),
  })
    .index('by_testId', ['testId'])
    .index('by_email', ['email']),

  testAnswers: defineTable({
    attemptId: v.id('testAttempts'),
    questionId: v.id('testQuestions'),
    selectedIndex: v.optional(v.number()),
    userAnswer: v.optional(v.string()),
    score: v.optional(v.number()),
    correct: v.optional(v.boolean()),
    aiFeedback: v.optional(v.string()),
    modelAnswer: v.optional(v.string()),
    gradedAt: v.optional(v.number()),
  })
    .index('by_attemptId', ['attemptId'])
    .index('by_attemptId_questionId', ['attemptId', 'questionId']),

  notifications: defineTable({
    userId: v.id('users'),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    href: v.optional(v.string()),
    params: v.optional(v.record(v.string(), v.string())),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_userId_createdAt', ['userId', 'createdAt'])
    .index('by_userId_read', ['userId', 'read']),

  savedJobPostings: defineTable({
    userId: v.id('users'),
    jobPostingId: v.id('recruitmentJobPostings'),
    createdAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_userId_jobPostingId', ['userId', 'jobPostingId']),
});
