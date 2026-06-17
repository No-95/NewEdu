import { query } from './_generated/server';
import type { QueryCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';
import { computeCareerCompletionScoreFromProfile } from './lib/careerScore';
import { computeSkillGaps } from './lib/skillGaps';

async function requireUser(ctx: QueryCtx, email: string) {
  const user = await ctx.db
    .query('users')
    .withIndex('by_email', (q) => q.eq('email', email.trim().toLowerCase()))
    .first();

  if (!user) {
    throw new Error('User not found.');
  }

  return user;
}

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B ₫`;
  }
  if (amount >= 1_000_000) {
    return `${Math.round(amount / 1_000_000)}M ₫`;
  }
  return `${Math.round(amount).toLocaleString('vi-VN')} ₫`;
}

function computeCareerCompletionScore(
  user: Doc<'users'>,
  profile: Doc<'careerProfiles'> | null,
  headline: string | null
) {
  return computeCareerCompletionScoreFromProfile(user, profile, headline);
}

function formatGoalLabel(onboarding: Doc<'userOnboarding'> | null) {
  if (!onboarding) return '—';
  if (onboarding.goals.length > 0) {
    return onboarding.goals.join(', ');
  }
  return onboarding.goalOtherText?.trim() || '—';
}

function formatLearnerLevel(onboarding: Doc<'userOnboarding'> | null) {
  return onboarding?.learnerStage?.trim() || '—';
}

function difficultyForLearnerStage(stage: string | undefined): 'beginner' | 'intermediate' | 'advanced' {
  switch (stage) {
    case 'topik_5_6':
      return 'advanced';
    case 'topik_3_4':
      return 'intermediate';
    case 'topik_1_2':
    case 'korean_none':
    default:
      return 'beginner';
  }
}

async function getCourseTitleMap(ctx: QueryCtx) {
  const courses = await ctx.db
    .query('courses')
    .withIndex('by_published', (q) => q.eq('published', true))
    .collect();

  const byId = new Map<Id<'courses'>, Doc<'courses'>>();
  const bySlug = new Map<string, Doc<'courses'>>();
  for (const course of courses) {
    byId.set(course._id, course);
    bySlug.set(course.slug, course);
  }
  return { courses, byId, bySlug };
}

export const getLearnerDashboard = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const onboarding = await ctx.db
      .query('userOnboarding')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();

    const { courses, byId } = await getCourseTitleMap(ctx);

    const progressRows = await ctx.db
      .query('userCourseProgress')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();

    const activeCourses: {
      title: string;
      slug: string;
      progress: number;
      lastVideoId?: string;
    }[] = [];
    let completedLectures = 0;
    let totalLectures = 0;
    let continueLearning: {
      courseTitle: string;
      courseSlug: string;
      videoId: string;
      progressPercent: number;
    } | null = null;
    let bestWatchedAt = 0;

    for (const row of progressRows) {
      completedLectures += row.completedLectures;
      totalLectures += row.totalLectures;
      const course = byId.get(row.courseId);
      if (!course) continue;
      const progress =
        row.totalLectures > 0 ? Math.round((row.completedLectures / row.totalLectures) * 100) : 0;

      if (row.lastVideoId && row.lastWatchedAt && row.lastWatchedAt > bestWatchedAt) {
        bestWatchedAt = row.lastWatchedAt;
        continueLearning = {
          courseTitle: course.title,
          courseSlug: course.slug,
          videoId: row.lastVideoId,
          progressPercent: progress,
        };
      }

      if (row.completedLectures < row.totalLectures || row.totalLectures === 0) {
        activeCourses.push({
          title: course.title,
          slug: course.slug,
          progress,
          lastVideoId: row.lastVideoId,
        });
      }
    }

    const activeSlugs = new Set(activeCourses.map((course) => course.slug));
    const purchases = await ctx.db.query('purchases').collect();
    const userPurchases = purchases.filter(
      (purchase) => purchase.userId === user._id.toString() && purchase.status === 'active'
    );

    for (const purchase of userPurchases) {
      const course = courses.find(
        (item) => item.slug === purchase.courseId || item._id.toString() === purchase.courseId
      );
      if (course && !activeSlugs.has(course.slug)) {
        activeCourses.push({ title: course.title, slug: course.slug, progress: 0 });
        activeSlugs.add(course.slug);
      }
    }

    const suggestedCourses = courses
      .filter((course) => !activeSlugs.has(course.slug))
      .slice(0, 5)
      .map((course) => ({ title: course.title, slug: course.slug }));

    const homeworkRows = await ctx.db
      .query('homeworks')
      .withIndex('by_assignedTo', (q) => q.eq('assignedTo', user._id))
      .collect();

    const homeworkItems = homeworkRows
      .filter((item) => item.status !== 'completed')
      .sort((a, b) => (a.dueDate ?? Number.MAX_SAFE_INTEGER) - (b.dueDate ?? Number.MAX_SAFE_INTEGER))
      .slice(0, 5)
      .map((item) => ({
        id: item._id.toString(),
        title: item.title,
        courseTitle: item.courseId ? byId.get(item.courseId)?.title ?? '—' : '—',
        courseSlug: item.courseId ? byId.get(item.courseId)?.slug : undefined,
        status: item.status,
        dueDate: item.dueDate ?? null,
      }));

    const normalizedEmail = user.email.trim().toLowerCase();
    const testAttempts = await ctx.db
      .query('testAttempts')
      .withIndex('by_email', (q) => q.eq('email', normalizedEmail))
      .collect();

    const recentTests: {
      externalId: string;
      title: string;
      scorePercent: number;
      submittedAt: number;
    }[] = [];

    for (const attempt of testAttempts
      .sort((a, b) => (b.submittedAt ?? b.startedAt) - (a.submittedAt ?? a.startedAt))
      .slice(0, 5)) {
      const test = await ctx.db.get(attempt.testId);
      if (!test) continue;
      const scorePercent =
        attempt.maxScore > 0 ? Math.round(((attempt.score ?? 0) / attempt.maxScore) * 100) : 0;
      recentTests.push({
        externalId: test.externalId,
        title: test.title,
        scorePercent,
        submittedAt: attempt.submittedAt ?? attempt.startedAt,
      });
    }

    const targetDifficulty = difficultyForLearnerStage(onboarding?.learnerStage);
    const topikTests = await ctx.db
      .query('tests')
      .withIndex('by_published_fieldId', (q) => q.eq('published', true).eq('fieldId', 'topik_exam'))
      .collect();

    const recommendedTopikTests = topikTests
      .filter((test) => test.featured || test.difficulty === targetDifficulty)
      .sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) || b.popularity - a.popularity
      )
      .slice(0, 5)
      .map((test) => ({
        externalId: test.externalId,
        title: test.title,
        difficulty: test.difficulty,
        durationMinutes: test.durationMinutes,
      }));

    const hasJobSeekerRole = (onboarding?.roles ?? []).includes('job_seeker');

    const forumPosts = await ctx.db.query('forumPosts').withIndex('by_createdAt').order('desc').take(6);
    const communities = forumPosts.map((post) => post.title);

    const newsArticles = await ctx.db
      .query('newsArticles')
      .withIndex('by_published_publishedAt', (q) => q.eq('published', true))
      .order('desc')
      .take(6);
    const events = newsArticles
      .filter((article) => article.category === 'events' || article.category === 'announcements')
      .map((article) => article.title);

    const openJobs = await ctx.db.query('recruitmentJobPostings').collect();
    const jobs = hasJobSeekerRole
      ? openJobs
          .filter((job) => job.status === 'open')
          .slice(0, 6)
          .map((job) => job.title)
      : [];

    const progressPercent =
      totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
    const hdpPoints = completedLectures * 10 + userPurchases.length * 100;

    const weakFieldIds = new Set<string>();
    for (const attempt of testAttempts.slice(0, 10)) {
      const pct =
        attempt.maxScore > 0 ? Math.round(((attempt.score ?? 0) / attempt.maxScore) * 100) : 100;
      if (pct >= 60) continue;
      const test = await ctx.db.get(attempt.testId);
      if (test?.fieldId) weakFieldIds.add(test.fieldId);
    }
    const studyRecommendations = [...weakFieldIds].slice(0, 3).map((fieldId) => ({
      fieldId,
      fieldLabelKey: `testsPage.fields.${fieldId}`,
      href: `/tests?field=${encodeURIComponent(fieldId)}`,
      labelKey: 'dashboard.nextSteps.learner.practiceField',
    }));

    const liveRooms = await ctx.db
      .query('liveClassrooms')
      .withIndex('by_status_lastActiveAt', (q) => q.eq('status', 'live'))
      .collect();
    const activeLiveRooms = liveRooms.slice(0, 6).map((room) => ({
      id: room.roomID,
      label: room.title || room.hostName || room.roomID,
      href: `/courses/classroom/${room.roomID}`,
    }));

    const nextStep =
      activeCourses.length === 0
        ? { labelKey: 'dashboard.nextSteps.learner.browseCourses', href: '/courses' }
        : homeworkItems.length > 0
          ? { labelKey: 'dashboard.nextSteps.learner.completeHomework', href: '/dashboard' }
          : studyRecommendations.length > 0
            ? {
                labelKey: 'dashboard.nextSteps.learner.practiceWeakArea',
                href: studyRecommendations[0].href,
              }
            : null;

    return {
      learnerStageKey: onboarding?.learnerStage ?? null,
      currentLevel: formatLearnerLevel(onboarding),
      goal: formatGoalLabel(onboarding),
      progressPercent,
      continueLearning,
      activeCourses,
      suggestedCourses,
      homeworkItems,
      recentTests,
      recommendedTopikTests,
      hasJobSeekerRole,
      jobs,
      communities,
      events,
      hdpId: user.hdpId ?? '—',
      hdpPoints,
      balance: user.balance ?? 0,
      balanceFormatted: formatCurrency(user.balance ?? 0),
      nextStep,
      studyRecommendations,
      liveRooms: activeLiveRooms,
    };
  },
});

export const getTeacherDashboard = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const ownerId = user._id;

    const onboarding = await ctx.db
      .query('userOnboarding')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();
    const isTrainingCenter = onboarding?.roles.includes('training_center') ?? false;

    const students = await ctx.db
      .query('trainingStudents')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();
    const classes = await ctx.db
      .query('trainingClasses')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();
    const leads = await ctx.db
      .query('crmLeads')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();
    const revenueRows = await ctx.db
      .query('businessRevenuePoints')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();

    const homeworkAssigned = await ctx.db.query('homeworks').collect();
    const pendingHomeworkCount = homeworkAssigned.filter(
      (hw) => hw.assignedBy === ownerId && hw.status !== 'completed'
    ).length;

    const ownedCourses = await ctx.db
      .query('courses')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();

    const today = new Date().toISOString().slice(0, 10);
    const followUpsToday = leads
      .filter((lead) => lead.followUpDate <= today && lead.stage !== 'enrolled')
      .slice(0, 5)
      .map((lead) => ({
        id: lead._id.toString(),
        name: lead.name,
        stage: lead.stage,
        followUpDate: lead.followUpDate,
        href: `/teacher-center/admission-crm?leadId=${lead._id.toString()}`,
      }));

    const activeStudents = students.filter((student) => student.status === 'active').length;
    const activeClasses = classes.length;
    const monthlyRevenue =
      revenueRows.length > 0 ? revenueRows[revenueRows.length - 1].value * 1_000_000 : 0;
    const consultedLeads = leads.filter((lead) =>
      ['contacted', 'interested', 'trial_class', 'enrolled'].includes(lead.stage)
    ).length;
    const pendingSignup = leads.filter((lead) =>
      ['new_lead', 'contacted', 'interested', 'trial_class'].includes(lead.stage)
    ).length;

    const studentNames = students.slice(0, 6).map((student) => `${student.name} · ${student.className}`);
    const classItems = classes.slice(0, 6).map((cls) => ({
      id: cls._id.toString(),
      name: cls.name,
      students: cls.students,
      capacity: cls.capacity,
      schedule: cls.schedule,
    }));

    const hostLabel = user.fullName?.trim() || user.email;
    const liveRooms = await ctx.db
      .query('liveClassrooms')
      .withIndex('by_status_lastActiveAt', (q) => q.eq('status', 'live'))
      .collect();
    const activeRooms = liveRooms
      .filter((room) => room.hostUserId === user._id || (!room.hostUserId && room.hostName === hostLabel))
      .slice(0, 4)
      .map((room) => ({
        id: room.roomID,
        label: room.title || room.roomID,
        href: `/courses/classroom/${room.roomID}`,
      }));

    const nextStep =
      students.length === 0
        ? { labelKey: 'dashboard.nextSteps.teacher.addStudent', href: '/teacher-center/training-management' }
        : leads.length === 0
          ? { labelKey: 'dashboard.nextSteps.teacher.addLead', href: '/teacher-center/admission-crm' }
          : null;

    return {
      isTrainingCenter,
      hasStudents: students.length > 0,
      hasClasses: classes.length > 0,
      hasLeads: leads.length > 0,
      nextStep,
      liveRooms: activeRooms,
      stats: {
        students: String(activeStudents || students.length),
        activeCourses: String(activeClasses),
        monthlyRevenue: formatCurrency(monthlyRevenue),
      },
      crm: {
        leads: String(leads.length),
        consulted: String(consultedLeads),
        pendingSignup: String(pendingSignup),
      },
      followUpsToday,
      classes: classItems,
      ownedCourseCount: ownedCourses.length,
      pendingHomeworkCount,
      recentStudents: studentNames,
    };
  },
});

export const getJobSeekerDashboard = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);

    const profile = await ctx.db
      .query('careerProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();

    const roleProfile = await ctx.db
      .query('userRoleProfiles')
      .withIndex('by_userId_roleKey', (q) => q.eq('userId', user._id).eq('roleKey', 'job_seeker'))
      .first();

    const onboarding = await ctx.db
      .query('userOnboarding')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();

    const completionScore = computeCareerCompletionScore(user, profile, roleProfile?.headline ?? null);

    const openJobs = await ctx.db
      .query('recruitmentJobPostings')
      .withIndex('by_status', (q) => q.eq('status', 'open'))
      .collect();

    const skillNames = (profile?.skills ?? []).map((s) => s.name.trim().toLowerCase()).filter(Boolean);
    const matchingJobs = openJobs
      .map((job) => {
        const haystack = `${job.title} ${job.department} ${job.description ?? ''}`.toLowerCase();
        let score = 0;
        for (const skill of skillNames) {
          if (haystack.includes(skill)) score += 1;
        }
        return { job, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ job }) => ({
        id: job._id.toString(),
        externalId: job.externalId,
        title: job.title,
        department: job.department,
        label: `${job.title} · ${job.department}`,
      }));

    const applications = await ctx.db
      .query('recruitmentCandidates')
      .withIndex('by_applicantUserId', (q) => q.eq('applicantUserId', user._id))
      .collect();

    const recentApplications = [];
    for (const app of applications.slice(0, 6)) {
      let title = app.position;
      if (app.jobPostingId) {
        const posting = await ctx.db.get(app.jobPostingId);
        if (posting) title = posting.title;
      }
      recentApplications.push({
        id: app._id.toString(),
        title,
        stage: app.stage,
        label: `${title} · ${app.stage}`,
      });
    }

    const skillSuggestions = (profile?.skills ?? [])
      .filter((skill) => skill.level < 80)
      .slice(0, 6)
      .map((skill) => `${skill.name} (${skill.level}%)`);

    const currentRole = profile?.experience?.[0]?.role ?? roleProfile?.headline ?? '—';
    const targetRole = onboarding?.jobSeekerStage?.trim() || roleProfile?.stageKey || '—';

    const newsArticles = await ctx.db
      .query('newsArticles')
      .withIndex('by_published_publishedAt', (q) => q.eq('published', true))
      .order('desc')
      .take(6);
    const careerEvents = newsArticles
      .filter((article) => ['events', 'announcements', 'partnerships'].includes(article.category))
      .map((article) => article.title);

    const forumPosts = await ctx.db.query('forumPosts').withIndex('by_createdAt').order('desc').take(6);
    const networkTags = [...new Set(forumPosts.flatMap((post) => post.tags).slice(0, 8))];

    const contactRequests = await ctx.db.query('contactSubmissions').order('desc').take(100);
    const careerSupport = contactRequests
      .filter((entry) => entry.email === user.email && entry.role?.includes('career'))
      .slice(0, 6)
      .map((entry) => ({
        id: entry._id.toString(),
        label: entry.feedback.split('\n')[0] || entry.fullName,
        status: entry.status,
      }));

    const skillGaps = computeSkillGaps(profile?.skills, openJobs);

    const nextStep =
      completionScore < 60
        ? { labelKey: 'dashboard.nextSteps.jobSeeker.completeProfile', href: '/career/profile' }
        : applications.length === 0
          ? { labelKey: 'dashboard.nextSteps.jobSeeker.browseJobs', href: '/jobs' }
          : null;

    const savedRows = await ctx.db
      .query('savedJobPostings')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();
    const savedJobs = [];
    for (const row of savedRows.slice(0, 6)) {
      const job = await ctx.db.get(row.jobPostingId);
      if (!job || job.status !== 'open') continue;
      savedJobs.push({
        id: job._id.toString(),
        externalId: job.externalId,
        label: `${job.title} · ${job.department}`,
      });
    }

    return {
      completionScore,
      matchingJobs,
      recentApplications,
      skillSuggestions,
      skillGaps,
      savedJobs,
      currentRole,
      targetRole,
      careerSupport,
      careerEvents,
      networkTags,
      nextStep,
    };
  },
});

export const getEmployerDashboard = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const ownerId = user._id;

    const jobPostings = await ctx.db
      .query('recruitmentJobPostings')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();
    const candidates = await ctx.db
      .query('recruitmentCandidates')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();
    const internalCourses = await ctx.db
      .query('internalCourses')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();
    const employeeProgress = await ctx.db
      .query('internalEmployeeProgress')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();

    const openJobs = jobPostings.filter((job) => job.status === 'open');
    const newApplicants = candidates.filter((c) => c.stage === 'applied').length;
    const interviewing = candidates.filter((candidate) => candidate.stage === 'interview').length;
    const offers = candidates.filter((candidate) => candidate.stage === 'offer').length;

    const openJobSummaries = openJobs.slice(0, 6).map((job) => ({
      id: job._id.toString(),
      externalId: job.externalId,
      title: job.title,
      applicants: job.applicants,
      label: `${job.title} · ${job.applicants} applicants`,
      href: '/business/recruitment',
    }));

    const topCandidates = candidates
      .filter((candidate) => candidate.score >= 70)
      .slice(0, 6)
      .map((candidate) => ({
        id: candidate._id.toString(),
        name: candidate.name,
        position: candidate.position,
        score: candidate.score,
        stage: candidate.stage,
        label: `${candidate.name} · ${candidate.position} (${candidate.score}/100)`,
        href: `/business/recruitment/candidates/${candidate._id.toString()}`,
      }));

    const trainingItems = internalCourses.slice(0, 6).map((course) => ({
      id: course._id.toString(),
      title: course.title,
      enrolled: course.enrolled,
      label: `${course.title} (${course.enrolled} enrolled)`,
    }));

    return {
      stats: {
        activeJobs: String(openJobs.length),
        newCandidates: String(newApplicants),
        interviews: String(interviewing),
        hired: String(offers),
      },
      openJobSummaries,
      topCandidates,
      trainingItems,
      employeeProgress: employeeProgress.slice(0, 6).map((row) => ({
        id: row._id.toString(),
        name: row.employeeName,
        progress: row.progress,
        label: `${row.employeeName} · ${row.progress}%`,
      })),
      pipelineCounts: {
        applied: candidates.filter((c) => c.stage === 'applied').length,
        screening: candidates.filter((c) => c.stage === 'screening').length,
        interview: interviewing,
        offer: offers,
      },
      nextStep:
        openJobs.length === 0
          ? { labelKey: 'dashboard.nextSteps.employer.postJob', href: '/business/recruitment' }
          : newApplicants > 0
            ? { labelKey: 'dashboard.nextSteps.employer.reviewApplicants', href: '/business/recruitment' }
            : null,
    };
  },
});

export const getExpertDashboard = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);

    const expertProfile = await ctx.db
      .query('expertProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();

    const consultationRequests = await ctx.db
      .query('expertConsultationRequests')
      .withIndex('by_expertUserId', (q) => q.eq('expertUserId', user._id))
      .collect();

    const articles = await ctx.db.query('newsArticles').collect();
    const authoredArticles = articles.filter(
      (article) => article.authorId === user._id && article.published
    );

    const forumPosts = await ctx.db.query('forumPosts').collect();
    const authoredPosts = forumPosts.filter((post) => post.authorId === user._id);

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newRequests = consultationRequests.filter((r) => r.status === 'new').length;
    const weeklyRequests = consultationRequests.filter((r) => r.createdAt >= weekAgo).length;

    const inbox = [];
    for (const req of consultationRequests.slice(0, 8)) {
      const requester = await ctx.db.get(req.requesterUserId);
      inbox.push({
        id: req._id.toString(),
        topic: req.topic,
        requesterName: requester?.fullName?.trim() || requester?.email || 'User',
        status: req.status,
        label: `${req.topic} · ${requester?.fullName?.trim() || 'User'}`,
        scheduledStart: req.scheduledStart,
        meetingUrl: req.meetingUrl,
        timezone: req.timezone,
      });
    }

    return {
      profilePublished: expertProfile?.published ?? false,
      headline: expertProfile?.headline ?? '—',
      expertise: expertProfile?.expertise ?? [],
      inbox,
      newRequests: String(newRequests),
      weeklyRequests: String(weeklyRequests),
      contentItems: [
        ...authoredArticles.slice(0, 4).map((a) => ({ id: a._id.toString(), label: a.title, type: 'article' as const })),
        ...authoredPosts.slice(0, 4).map((p) => ({ id: p._id.toString(), label: p.title, type: 'post' as const })),
      ].slice(0, 6),
      activityCount: authoredArticles.length + authoredPosts.length,
      nextStep: !expertProfile?.published
        ? { labelKey: 'dashboard.nextSteps.expert.publishProfile', href: '/experts/profile' }
        : newRequests > 0
          ? { labelKey: 'dashboard.nextSteps.expert.reviewInbox', href: '/dashboard' }
          : null,
    };
  },
});
