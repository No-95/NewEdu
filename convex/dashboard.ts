import { query } from './_generated/server';
import type { QueryCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';

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
  let score = 0;
  if (user.fullName?.trim()) score += 15;
  if (user.phone?.trim()) score += 10;
  if (headline?.trim()) score += 15;
  if (profile?.location?.trim()) score += 10;
  if (profile?.education?.length) score += 15;
  if (profile?.skills?.length) score += 15;
  if (profile?.experience?.length) score += 10;
  if (profile?.certificates?.length) score += 5;
  if (profile?.languages?.length) score += 5;
  return Math.min(100, score);
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

    const activeCourses: { title: string; slug: string; progress: number }[] = [];
    let completedLectures = 0;
    let totalLectures = 0;

    for (const row of progressRows) {
      completedLectures += row.completedLectures;
      totalLectures += row.totalLectures;
      const course = byId.get(row.courseId);
      if (!course) continue;
      const progress =
        row.totalLectures > 0 ? Math.round((row.completedLectures / row.totalLectures) * 100) : 0;
      if (row.completedLectures < row.totalLectures || row.totalLectures === 0) {
        activeCourses.push({ title: course.title, slug: course.slug, progress });
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
      .map((course) => course.title);

    const homeworks = await ctx.db
      .query('homeworks')
      .withIndex('by_assignedTo', (q) => q.eq('assignedTo', user._id))
      .collect();

    const materials = [
      ...homeworks.map((item) => item.title),
      ...courses.slice(0, 3).map((course) => course.title),
    ].slice(0, 6);

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
    const jobs = openJobs
      .filter((job) => job.status === 'open')
      .slice(0, 6)
      .map((job) => job.title);

    const progressPercent =
      totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
    const hdpPoints = completedLectures * 10 + userPurchases.length * 100;

    return {
      currentLevel: formatLearnerLevel(onboarding),
      goal: formatGoalLabel(onboarding),
      progressPercent,
      activeCourses,
      suggestedCourses,
      jobs,
      materials,
      communities,
      events,
      hdpId: user.hdpId ?? '—',
      hdpPoints,
      balance: user.balance ?? 0,
      balanceFormatted: formatCurrency(user.balance ?? 0),
    };
  },
});

export const getTeacherDashboard = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const ownerId = user._id;

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

    const publishedCourses = await ctx.db
      .query('courses')
      .withIndex('by_published', (q) => q.eq('published', true))
      .collect();

    const activeStudents = students.filter((student) => student.status === 'active').length;
    const activeClasses = classes.filter((cls) => cls.students > 0).length;
    const monthlyRevenue =
      revenueRows.length > 0 ? revenueRows[revenueRows.length - 1].value * 1_000_000 : 0;
    const consultedLeads = leads.filter((lead) =>
      ['contacted', 'interested', 'trial_class', 'enrolled'].includes(lead.stage)
    ).length;
    const pendingSignup = leads.filter((lead) =>
      ['new_lead', 'contacted', 'interested', 'trial_class'].includes(lead.stage)
    ).length;

    const studentNames = students.slice(0, 6).map((student) => `${student.name} · ${student.className}`);

    return {
      stats: {
        students: String(activeStudents || students.length),
        activeCourses: String(activeClasses || publishedCourses.length),
        monthlyRevenue: formatCurrency(monthlyRevenue),
      },
      crm: {
        leads: String(leads.length),
        consulted: String(consultedLeads),
        pendingSignup: String(pendingSignup),
      },
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

    const openJobs = await ctx.db.query('recruitmentJobPostings').collect();
    const matchingJobs = openJobs
      .filter((job) => job.status === 'open')
      .slice(0, 6)
      .map((job) => `${job.title} · ${job.department}`);

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
    const networkTags = [
      ...new Set(forumPosts.flatMap((post) => post.tags).slice(0, 8)),
    ];

    const contactRequests = await ctx.db.query('contactSubmissions').order('desc').take(50);
    const userContacts = contactRequests.filter(
      (entry) => entry.email === user.email && entry.role?.includes('career')
    );

    return {
      completionScore,
      matchingJobs,
      recruiterViews: String(userContacts.length),
      interviewInvites: String(
        userContacts.filter((entry) => entry.feedback.toLowerCase().includes('interview')).length
      ),
      skillSuggestions,
      currentRole,
      targetRole,
      advisors: userContacts.slice(0, 4).map((entry) => entry.organization || entry.fullName),
      careerEvents,
      networkTags,
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

    const openJobs = jobPostings.filter((job) => job.status === 'open').length;
    const interviewing = candidates.filter((candidate) => candidate.stage === 'interview').length;
    const hired = candidates.filter((candidate) => candidate.stage === 'offer').length;

    const talentPoolTags = [
      ...new Set(candidates.slice(0, 8).map((candidate) => candidate.position)),
    ];

    const trainingItems = internalCourses.slice(0, 6).map((course) => `${course.title} (${course.enrolled} enrolled)`);
    const matchingItems = candidates
      .filter((candidate) => candidate.score >= 70)
      .slice(0, 6)
      .map((candidate) => `${candidate.name} · ${candidate.position} (${candidate.score}/100)`);

    const newsArticles = await ctx.db
      .query('newsArticles')
      .withIndex('by_published_publishedAt', (q) => q.eq('published', true))
      .order('desc')
      .take(6);
    const events = newsArticles.map((article) => article.title);

    return {
      stats: {
        activeJobs: String(openJobs),
        newCandidates: String(candidates.length),
        interviews: String(interviewing),
        hired: String(hired),
      },
      talentPoolTags,
      trainingItems,
      matchingItems,
      employeeProgress: employeeProgress.slice(0, 6).map((row) => `${row.employeeName} · ${row.progress}%`),
      events,
    };
  },
});

export const getExpertDashboard = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);

    const roleProfile = await ctx.db
      .query('userRoleProfiles')
      .withIndex('by_userId_roleKey', (q) => q.eq('userId', user._id).eq('roleKey', 'expert'))
      .first();

    const articles = await ctx.db.query('newsArticles').collect();
    const authoredArticles = articles.filter(
      (article) => article.authorId === user._id && article.published
    );

    const forumPosts = await ctx.db.query('forumPosts').collect();
    const authoredPosts = forumPosts.filter((post) => post.authorId === user._id);

    const contactRequests = await ctx.db.query('contactSubmissions').order('desc').take(100);
    const expertRequests = contactRequests.filter(
      (entry) =>
        entry.feedback.toLowerCase().includes('expert') ||
        entry.feedback.toLowerCase().includes('consultation') ||
        entry.role?.includes('expert')
    );

    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_userId_createdAt', (q) => q.eq('userId', user._id))
      .order('desc')
      .collect();

    const deposits = transactions.filter((tx) => tx.type === 'deposit' && tx.amount > 0);
    const purchases = transactions.filter((tx) => tx.type === 'purchase');
    const consultingTotal = expertRequests.length * 500_000;
    const coursesTotal = purchases.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const seminarsTotal = deposits.reduce((sum, tx) => sum + tx.amount, 0);

    const credibility =
      roleProfile?.headline?.trim() ||
      (authoredArticles.length + authoredPosts.length > 0
        ? `Contributor · ${authoredArticles.length + authoredPosts.length} posts`
        : '—');

    return {
      credibility,
      followers: String(authoredPosts.length + expertRequests.length),
      activity: [
        ...authoredArticles.slice(0, 3).map((article) => article.title),
        ...authoredPosts.slice(0, 3).map((post) => post.title),
      ].slice(0, 6),
      consulting: {
        newRequests: String(expertRequests.filter((entry) => entry.status === 'new').length),
        weeklySessions: String(
          expertRequests.filter((entry) => {
            const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            return entry.createdAt >= weekAgo;
          }).length
        ),
      },
      professionalCommunity: forumPosts.slice(0, 6).map((post) => post.title),
      collaboration: expertRequests.slice(0, 6).map((entry) => entry.fullName),
      contentMgmt: authoredArticles.slice(0, 6).map((article) => article.title),
      income: {
        consulting: formatCurrency(consultingTotal),
        courses: formatCurrency(coursesTotal),
        seminars: formatCurrency(seminarsTotal),
      },
      personalBrand: [
        roleProfile?.bio?.trim(),
        roleProfile?.experienceSummary?.trim(),
        user.hdpId ? `HDP ID: ${user.hdpId}` : null,
      ].filter((item): item is string => Boolean(item)),
    };
  },
});
