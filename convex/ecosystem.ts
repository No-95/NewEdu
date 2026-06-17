import { query } from './_generated/server';
import type { QueryCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Doc } from './_generated/dataModel';
import { computeCareerCompletionScoreFromProfile } from './lib/careerScore';

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

function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

function monthStartMs(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
}

function computeCareerCompletionScore(
  user: Doc<'users'>,
  profile: Doc<'careerProfiles'> | null,
  headline: string | null
) {
  return computeCareerCompletionScoreFromProfile(user, profile, headline);
}

export const getInternalTrainingDashboard = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const ownerId = user._id;

    const courses = await ctx.db
      .query('internalCourses')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();

    const employeeProgress = await ctx.db
      .query('internalEmployeeProgress')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();

    const employees = await ctx.db
      .query('hrEmployees')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();
    const employeeById = new Map(employees.map((e) => [e._id.toString(), e]));

    async function resolveProgress(row: Doc<'internalEmployeeProgress'>) {
      if (!row.platformCourseSlug) return row.progress;
      const employee = row.employeeId ? employeeById.get(row.employeeId.toString()) : undefined;
      const employeeEmail = employee?.email?.trim().toLowerCase();
      if (!employeeEmail) return row.progress;

      const platformUser = await ctx.db
        .query('users')
        .withIndex('by_email', (q) => q.eq('email', employeeEmail))
        .first();
      if (!platformUser) return row.progress;

      const course = await ctx.db
        .query('courses')
        .withIndex('by_slug', (q) => q.eq('slug', row.platformCourseSlug!))
        .first();
      if (!course) return row.progress;

      const userProgress = await ctx.db
        .query('userCourseProgress')
        .withIndex('by_user_course', (q) =>
          q.eq('userId', platformUser._id).eq('courseId', course._id)
        )
        .first();
      if (!userProgress || userProgress.totalLectures <= 0) return row.progress;

      return Math.round((userProgress.completedLectures / userProgress.totalLectures) * 100);
    }

    const syncedProgress = await Promise.all(
      employeeProgress.map(async (row) => ({
        id: row._id.toString(),
        name: row.employeeName,
        progress: await resolveProgress(row),
      }))
    );

    const totalEnrolled = courses.reduce((sum, course) => sum + course.enrolled, 0);
    const totalCompleted = courses.reduce((sum, course) => sum + course.completed, 0);
    const completionRate =
      totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;
    const complianceCourses = courses.filter((course) => course.compliance);
    const complianceRate =
      courses.length > 0
        ? Math.round((complianceCourses.filter((c) => c.completed >= c.enrolled && c.enrolled > 0).length / courses.length) * 100)
        : 0;

    return {
      metrics: [
        { id: 'completionRate', value: formatPercent(completionRate, 0), accent: true },
        { id: 'courseCount', value: String(courses.length) },
        { id: 'certificatesIssued', value: String(totalCompleted) },
        { id: 'complianceRate', value: formatPercent(complianceRate, 0) },
      ],
      courses: courses.map((course) => ({
        id: course._id.toString(),
        title: course.title,
        enrolled: course.enrolled,
        completed: course.completed,
        compliance: course.compliance,
      })),
      employeeProgress: syncedProgress,
    };
  },
});

export const getHrDashboard = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const ownerId = user._id;

    const employees = await ctx.db
      .query('hrEmployees')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();

    const departments = await ctx.db
      .query('hrDepartments')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();

    const reviews = await ctx.db
      .query('hrReviews')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();

    const activeEmployees = employees.filter((employee) => employee.status === 'active').length;
    const retentionRate =
      employees.length > 0 ? Math.round((activeEmployees / employees.length) * 100) : 0;

    return {
      metrics: [
        { id: 'employeeCount', value: String(employees.length) },
        { id: 'departmentCount', value: String(departments.length) },
        { id: 'reviewCount', value: String(reviews.length) },
        { id: 'retentionRate', value: formatPercent(retentionRate, 0) },
      ],
      employees: employees.map((employee) => ({
        id: employee._id.toString(),
        name: employee.name,
        department: employee.department,
        role: employee.role,
        joinDate: employee.joinDate,
        status: employee.status,
      })),
      departments: departments.map((department) => ({
        id: department._id.toString(),
        name: department.name,
        head: department.head,
        employees: department.employees,
      })),
      reviews: reviews.map((review) => ({
        id: review._id.toString(),
        employee: review.employee,
        period: review.period,
        rating: review.rating,
        status: review.status,
      })),
    };
  },
});

export const getTrainingManagementDashboard = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const ownerId = user._id;

    const students = await ctx.db
      .query('trainingStudents')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();

    const teachers = await ctx.db
      .query('trainingTeachers')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();

    const classes = await ctx.db
      .query('trainingClasses')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();

    const activeClasses = classes.filter((cls) => cls.students > 0).length;
    const activeTeachers = teachers.filter((teacher) => teacher.status === 'active').length;
    const avgAttendance =
      students.length > 0
        ? students.reduce((sum, student) => sum + student.attendanceRate, 0) / students.length
        : 0;
    const avgCompletion =
      classes.length > 0
        ? classes.reduce((sum, cls) => sum + cls.completionRate, 0) / classes.length
        : 0;

    return {
      metrics: [
        { id: 'totalStudents', value: String(students.length), accent: true },
        { id: 'activeClasses', value: String(activeClasses) },
        { id: 'teacherCount', value: String(teachers.length) },
        { id: 'attendanceRate', value: formatPercent(avgAttendance) },
        { id: 'completionRate', value: formatPercent(avgCompletion), accent: true },
      ],
      students: students.map((student) => ({
        id: student._id.toString(),
        name: student.name,
        email: student.email,
        className: student.className,
        status: student.status,
        attendanceRate: student.attendanceRate,
      })),
      teachers: teachers.map((teacher) => ({
        id: teacher._id.toString(),
        name: teacher.name,
        subject: teacher.subject,
        classes: teacher.classes,
        students: teacher.students,
        status: teacher.status,
      })),
      classes: classes.map((cls) => ({
        id: cls._id.toString(),
        name: cls.name,
        teacher: cls.teacher,
        schedule: cls.schedule,
        students: cls.students,
        capacity: cls.capacity,
        completionRate: cls.completionRate,
      })),
    };
  },
});

export const getAdmissionCrmDashboard = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const ownerId = user._id;
    const monthStart = monthStartMs();

    const leads = await ctx.db
      .query('crmLeads')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();

    const newLeadsThisMonth = leads.filter((lead) => lead.createdAt >= monthStart).length;
    const enrolledLeads = leads.filter((lead) => lead.stage === 'enrolled').length;
    const conversionRate = leads.length > 0 ? (enrolledLeads / leads.length) * 100 : 0;
    const enrollmentRevenue = leads.reduce(
      (sum, lead) => sum + (lead.revenueAmount ?? 0),
      0
    );
    const followUpNeeded = leads.filter(
      (lead) => lead.stage !== 'enrolled' && lead.followUpDate.trim() !== '—'
    ).length;

    const sourceTotals = new Map<string, number>();
    for (const lead of leads) {
      sourceTotals.set(lead.source, (sourceTotals.get(lead.source) ?? 0) + 1);
    }
    const totalSources = leads.length || 1;
    const leadSourceChart = Array.from(sourceTotals.entries())
      .map(([label, count]) => ({
        label,
        value: Math.round((count / totalSources) * 100),
      }))
      .sort((a, b) => b.value - a.value);

    return {
      metrics: [
        { id: 'newLeadsMonth', value: String(newLeadsThisMonth), accent: true },
        { id: 'conversionRate', value: formatPercent(conversionRate) },
        { id: 'enrollmentRevenue', value: formatCurrency(enrollmentRevenue), accent: true },
        { id: 'followUpNeeded', value: String(followUpNeeded) },
      ],
      leadSourceChart,
      conversionRate: Math.round(conversionRate * 10) / 10,
      enrollmentRevenue: formatCurrency(enrollmentRevenue),
      leads: leads.map((lead) => ({
        id: lead._id.toString(),
        name: lead.name,
        phone: lead.phone,
        source: lead.source,
        stage: lead.stage,
        followUpDate: lead.followUpDate,
        notes: lead.notes,
      })),
    };
  },
});

export const getBusinessDevelopmentDashboard = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const ownerId = user._id;

    const partners = await ctx.db
      .query('businessPartners')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();

    const referrals = await ctx.db
      .query('businessReferrals')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();

    const revenueChartRows = await ctx.db
      .query('businessRevenuePoints')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();

    const activePartners = partners.filter((partner) => partner.status === 'active').length;
    const convertedReferrals = referrals.filter((referral) => referral.status === 'converted').length;
    const conversionRate =
      referrals.length > 0 ? (convertedReferrals / referrals.length) * 100 : 0;
    const monthlyRevenue =
      revenueChartRows.length > 0
        ? revenueChartRows[revenueChartRows.length - 1].value
        : partners.reduce((sum, partner) => {
            const numeric = Number.parseFloat(partner.revenue.replace(/[^\d.]/g, '')) || 0;
            return sum + numeric;
          }, 0);
    const totalCommission = partners.reduce((sum, partner) => {
      const numeric = Number.parseFloat(partner.commission.replace(/[^\d.]/g, '')) || 0;
      return sum + numeric;
    }, 0);

    return {
      metrics: [
        { id: 'monthlyRevenue', value: formatCurrency(monthlyRevenue * 1_000_000), accent: true },
        { id: 'activePartners', value: String(activePartners) },
        { id: 'conversionRate', value: formatPercent(conversionRate) },
        { id: 'monthlyCommission', value: formatCurrency(totalCommission * 1_000_000) },
      ],
      revenueChart: revenueChartRows.map((point) => ({
        label: point.label,
        value: point.value,
      })),
      partners: partners.map((partner) => ({
        id: partner._id.toString(),
        name: partner.name,
        type: partner.type,
        referrals: partner.referrals,
        revenue: partner.revenue,
        commission: partner.commission,
        status: partner.status,
      })),
      referrals: referrals.map((referral) => ({
        id: referral._id.toString(),
        partner: referral.partner,
        student: referral.student,
        date: referral.date,
        amount: referral.amount,
        status: referral.status,
      })),
    };
  },
});

export const getReportingDashboard = query({
  args: {
    email: v.string(),
    since: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const ownerId = user._id;
    const sinceMs = args.since ?? 0;

    const students = (await ctx.db
      .query('trainingStudents')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect()).filter((student) => student.createdAt >= sinceMs);

    const teachers = await ctx.db
      .query('trainingTeachers')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();

    const classes = await ctx.db
      .query('trainingClasses')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();

    const revenueChartRows = await ctx.db
      .query('businessRevenuePoints')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();

    const studentGrowthRows = await ctx.db
      .query('studentGrowthPoints')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
      .collect();

    const monthStart = monthStartMs();
    const newStudentsThisMonth = students.filter((student) => student.createdAt >= monthStart).length;
    const avgCompletion =
      classes.length > 0
        ? classes.reduce((sum, cls) => sum + cls.completionRate, 0) / classes.length
        : 0;
    const ratedTeachers = teachers.filter((teacher) => teacher.rating !== undefined);
    const avgTeacherRating =
      ratedTeachers.length > 0
        ? ratedTeachers.reduce((sum, teacher) => sum + (teacher.rating ?? 0), 0) / ratedTeachers.length
        : 0;
    const monthlyRevenue =
      revenueChartRows.length > 0
        ? revenueChartRows[revenueChartRows.length - 1].value
        : 0;

    const teacherReports = teachers.map((teacher) => {
      const teacherClasses = classes.filter((cls) => cls.teacher === teacher.name);
      const completion =
        teacherClasses.length > 0
          ? Math.round(
              teacherClasses.reduce((sum, cls) => sum + cls.completionRate, 0) / teacherClasses.length
            )
          : 0;

      return {
        id: teacher._id.toString(),
        name: teacher.name,
        rating: teacher.rating ?? 0,
        classes: teacher.classes,
        completion,
      };
    });

    return {
      metrics: [
        { id: 'monthlyRevenue', value: formatCurrency(monthlyRevenue * 1_000_000), accent: true },
        { id: 'newStudents', value: newStudentsThisMonth > 0 ? `+${newStudentsThisMonth}` : '0' },
        { id: 'courseCompletion', value: formatPercent(avgCompletion) },
        {
          id: 'teacherRating',
          value: avgTeacherRating > 0 ? `${avgTeacherRating.toFixed(1)}/5` : '—',
        },
      ],
      revenueChart: revenueChartRows.map((point) => ({ label: point.label, value: point.value })),
      studentGrowthChart: studentGrowthRows.map((point) => ({ label: point.label, value: point.value })),
      completionChart: classes.map((cls) => ({
        label: cls.name,
        value: cls.completionRate,
      })),
      teacherReports,
    };
  },
});

export const getCareerProfile = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);

    const profile = await ctx.db
      .query('careerProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();

    const roleProfile = await ctx.db
      .query('userRoleProfiles')
      .withIndex('by_userId_roleKey', (q) =>
        q.eq('userId', user._id).eq('roleKey', 'job_seeker')
      )
      .first();

    const headline = roleProfile?.headline ?? '';

    return {
      fullName: user.fullName ?? '',
      email: user.email,
      phone: user.phone ?? '',
      location: profile?.location ?? '',
      headline,
      completionScore: computeCareerCompletionScore(user, profile, headline),
      education: profile?.education ?? [],
      skills: profile?.skills ?? [],
      certificates: profile?.certificates ?? [],
      experience: profile?.experience ?? [],
      languages: profile?.languages ?? [],
    };
  },
});

export const getRecruitmentDashboard = query({
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

    const openPositions = jobPostings.filter((posting) => posting.status === 'open').length;
    const totalApplicants = jobPostings.reduce((sum, posting) => sum + posting.applicants, 0);
    const interviewing = candidates.filter((candidate) => candidate.stage === 'interview').length;
    const pendingOffers = candidates.filter((candidate) => candidate.stage === 'offer').length;

    return {
      metrics: [
        { id: 'openPositions', value: String(openPositions), accent: true },
        { id: 'totalApplicants', value: String(totalApplicants) },
        { id: 'interviewing', value: String(interviewing) },
        { id: 'pendingOffers', value: String(pendingOffers) },
      ],
      jobPostings: jobPostings.map((posting) => ({
        id: posting._id.toString(),
        title: posting.title,
        department: posting.department,
        location: posting.location,
        salary: posting.salary,
        description: posting.description,
        applicants: posting.applicants,
        status: posting.status,
        postedAt: posting.postedAt,
      })),
      candidates: candidates.map((candidate) => ({
        id: candidate._id.toString(),
        name: candidate.name,
        position: candidate.position,
        stage: candidate.stage,
        score: candidate.score,
      })),
    };
  },
});
