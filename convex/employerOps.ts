import { mutation, query } from './_generated/server';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';
import { notifyUser } from './lib/notificationsHelper';
import {
  nextRecruitmentStage,
  recruitmentStageValidator,
} from './lib/recruitmentStages';
import { insertStageEvent, listStageEventsForCandidate } from './lib/stageEventsHelper';

const stageEventValidator = v.object({
  fromStage: v.optional(recruitmentStageValidator),
  toStage: recruitmentStageValidator,
  createdAt: v.number(),
});

async function requireOwner(ctx: QueryCtx | MutationCtx, email: string) {
  const user = await ctx.db
    .query('users')
    .withIndex('by_email', (q) => q.eq('email', email.trim().toLowerCase()))
    .first();
  if (!user) throw new Error('User not found.');
  return user;
}

const requireUser = requireOwner;

function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export const listOpenJobPostings = query({
  args: {},
  returns: v.array(
    v.object({
      id: v.string(),
      externalId: v.string(),
      title: v.string(),
      department: v.string(),
      location: v.optional(v.string()),
      description: v.optional(v.string()),
      salary: v.optional(v.string()),
      companyName: v.string(),
      postedAt: v.string(),
      applicants: v.number(),
    })
  ),
  handler: async (ctx) => {
    const postings = await ctx.db
      .query('recruitmentJobPostings')
      .withIndex('by_status', (q) => q.eq('status', 'open'))
      .collect();

    const results = [];
    for (const posting of postings) {
      const owner = await ctx.db.get(posting.ownerId);
      results.push({
        id: posting._id.toString(),
        externalId: posting.externalId,
        title: posting.title,
        department: posting.department,
        location: posting.location,
        description: posting.description,
        salary: posting.salary,
        companyName: owner?.fullName?.trim() || 'HDP Partner',
        postedAt: posting.postedAt,
        applicants: posting.applicants,
      });
    }
    return results.sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  },
});

export const getJobPostingByExternalId = query({
  args: { externalId: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      id: v.string(),
      externalId: v.string(),
      title: v.string(),
      department: v.string(),
      location: v.optional(v.string()),
      description: v.optional(v.string()),
      salary: v.optional(v.string()),
      companyName: v.string(),
      postedAt: v.string(),
      status: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const posting = await ctx.db
      .query('recruitmentJobPostings')
      .withIndex('by_externalId', (q) => q.eq('externalId', args.externalId))
      .first();
    if (!posting || posting.status !== 'open') return null;
    const owner = await ctx.db.get(posting.ownerId);
    return {
      id: posting._id.toString(),
      externalId: posting.externalId,
      title: posting.title,
      department: posting.department,
      location: posting.location,
      description: posting.description,
      salary: posting.salary,
      companyName: owner?.fullName?.trim() || 'HDP Partner',
      postedAt: posting.postedAt,
      status: posting.status,
    };
  },
});

export const createJobPosting = mutation({
  args: {
    email: v.string(),
    title: v.string(),
    department: v.string(),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
    salary: v.optional(v.string()),
    status: v.optional(v.union(v.literal('open'), v.literal('draft'))),
  },
  returns: v.object({ id: v.string(), externalId: v.string() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const now = Date.now();
    let externalId = slugify(args.title) || `job-${now}`;
    const existing = await ctx.db
      .query('recruitmentJobPostings')
      .withIndex('by_externalId', (q) => q.eq('externalId', externalId))
      .first();
    if (existing) externalId = `${externalId}-${now}`;

    const status = args.status ?? 'open';

    const id = await ctx.db.insert('recruitmentJobPostings', {
      ownerId: owner._id,
      externalId,
      title: args.title.trim(),
      department: args.department.trim(),
      location: args.location?.trim(),
      description: args.description?.trim(),
      salary: args.salary?.trim(),
      applicants: 0,
      status,
      postedAt: new Date().toISOString().slice(0, 10),
      createdAt: now,
      updatedAt: now,
    });
    return { id: id.toString(), externalId };
  },
});

export const updateJobPostingStatus = mutation({
  args: {
    email: v.string(),
    jobPostingId: v.id('recruitmentJobPostings'),
    status: v.union(v.literal('open'), v.literal('closed'), v.literal('draft')),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const posting = await ctx.db.get(args.jobPostingId);
    if (!posting || posting.ownerId !== owner._id) throw new Error('Job not found.');
    await ctx.db.patch(args.jobPostingId, { status: args.status, updatedAt: Date.now() });
    return { success: true };
  },
});

export const updateJobPosting = mutation({
  args: {
    email: v.string(),
    jobPostingId: v.id('recruitmentJobPostings'),
    title: v.optional(v.string()),
    department: v.optional(v.string()),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
    salary: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const posting = await ctx.db.get(args.jobPostingId);
    if (!posting || posting.ownerId !== owner._id) throw new Error('Job not found.');
    const patch: Partial<Doc<'recruitmentJobPostings'>> = { updatedAt: Date.now() };
    if (args.title !== undefined) patch.title = args.title.trim();
    if (args.department !== undefined) patch.department = args.department.trim();
    if (args.location !== undefined) patch.location = args.location.trim() || undefined;
    if (args.description !== undefined) patch.description = args.description.trim() || undefined;
    if (args.salary !== undefined) patch.salary = args.salary.trim() || undefined;
    await ctx.db.patch(args.jobPostingId, patch);
    return { success: true };
  },
});

export const createCandidate = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    position: v.string(),
    score: v.optional(v.number()),
    jobPostingId: v.optional(v.id('recruitmentJobPostings')),
  },
  returns: v.object({ id: v.string() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const now = Date.now();
    const id = await ctx.db.insert('recruitmentCandidates', {
      ownerId: owner._id,
      jobPostingId: args.jobPostingId,
      name: args.name.trim(),
      position: args.position.trim(),
      stage: 'applied',
      score: args.score ?? 0,
      createdAt: now,
      updatedAt: now,
    });
    await insertStageEvent(ctx, {
      candidateId: id,
      toStage: 'applied',
      actorUserId: owner._id,
      createdAt: now,
    });
    return { id: id.toString() };
  },
});

export const advanceCandidateStage = mutation({
  args: {
    email: v.string(),
    candidateId: v.id('recruitmentCandidates'),
  },
  returns: v.object({ stage: v.union(recruitmentStageValidator, v.null()) }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const candidate = await ctx.db.get(args.candidateId);
    if (!candidate || candidate.ownerId !== owner._id) throw new Error('Candidate not found.');
    const next = nextRecruitmentStage(candidate.stage);
    if (!next) return { stage: null };
    const now = Date.now();
    await ctx.db.patch(args.candidateId, { stage: next, updatedAt: now });
    await insertStageEvent(ctx, {
      candidateId: args.candidateId,
      fromStage: candidate.stage,
      toStage: next,
      actorUserId: owner._id,
      createdAt: now,
    });

    if (candidate.applicantUserId) {
      await notifyUser(ctx, {
        userId: candidate.applicantUserId,
        type: 'application_stage',
        title: 'Application update',
        body: `Your application for ${candidate.position} moved to ${next}.`,
        href: `/career/applications/${args.candidateId}`,
        params: { position: candidate.position, stage: next },
      });
    }

    return { stage: next };
  },
});

export const rejectCandidate = mutation({
  args: {
    email: v.string(),
    candidateId: v.id('recruitmentCandidates'),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const candidate = await ctx.db.get(args.candidateId);
    if (!candidate || candidate.ownerId !== owner._id) throw new Error('Candidate not found.');
    const now = Date.now();
    await ctx.db.patch(args.candidateId, { stage: 'rejected', updatedAt: now });
    await insertStageEvent(ctx, {
      candidateId: args.candidateId,
      fromStage: candidate.stage,
      toStage: 'rejected',
      actorUserId: owner._id,
      createdAt: now,
    });

    if (candidate.applicantUserId) {
      await notifyUser(ctx, {
        userId: candidate.applicantUserId,
        type: 'application_rejected',
        title: 'Application update',
        body: `Your application for ${candidate.position} was not selected at this time.`,
        href: `/career/applications/${args.candidateId}`,
        params: { position: candidate.position },
      });
    }

    return { success: true };
  },
});

export const applyToJob = mutation({
  args: {
    applicantEmail: v.string(),
    jobPostingId: v.id('recruitmentJobPostings'),
  },
  returns: v.object({ candidateId: v.string() }),
  handler: async (ctx, args) => {
    const applicant = await requireOwner(ctx, args.applicantEmail);
    const posting = await ctx.db.get(args.jobPostingId);
    if (!posting || posting.status !== 'open') throw new Error('Job not found or closed.');

    const existing = await ctx.db
      .query('recruitmentCandidates')
      .withIndex('by_applicantUserId', (q) => q.eq('applicantUserId', applicant._id))
      .collect();
    if (existing.some((c) => c.jobPostingId === args.jobPostingId)) {
      throw new Error('You have already applied to this job.');
    }

    const profile = await ctx.db
      .query('careerProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', applicant._id))
      .first();

    const now = Date.now();
    const candidateId = await ctx.db.insert('recruitmentCandidates', {
      ownerId: posting.ownerId,
      jobPostingId: args.jobPostingId,
      applicantUserId: applicant._id,
      name: applicant.fullName?.trim() || applicant.email,
      position: posting.title,
      stage: 'applied',
      score: profile?.skills?.length ? Math.min(100, profile.skills.length * 15) : 50,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(args.jobPostingId, {
      applicants: posting.applicants + 1,
      updatedAt: now,
    });

    await insertStageEvent(ctx, {
      candidateId,
      toStage: 'applied',
      actorUserId: applicant._id,
      createdAt: now,
    });

    await notifyUser(ctx, {
      userId: posting.ownerId,
      type: 'new_applicant',
      title: 'New job applicant',
      body: `${applicant.fullName?.trim() || applicant.email} applied for ${posting.title}.`,
      href: `/business/recruitment/candidates/${candidateId}`,
      params: {
        applicantName: applicant.fullName?.trim() || applicant.email,
        jobTitle: posting.title,
      },
    });

    await notifyUser(ctx, {
      userId: applicant._id,
      type: 'application_submitted',
      title: 'Application submitted',
      body: `You applied for ${posting.title}.`,
      href: `/career/applications/${candidateId}`,
      params: { jobTitle: posting.title },
    });

    return { candidateId: candidateId.toString() };
  },
});

export const listApplicationsForUser = query({
  args: { email: v.string() },
  returns: v.array(
    v.object({
      id: v.string(),
      jobTitle: v.string(),
      companyName: v.string(),
      stage: v.string(),
      appliedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const user = await requireOwner(ctx, args.email);
    const applications = await ctx.db
      .query('recruitmentCandidates')
      .withIndex('by_applicantUserId', (q) => q.eq('applicantUserId', user._id))
      .collect();

    const results = [];
    for (const app of applications) {
      let jobTitle = app.position;
      let companyName = '—';
      if (app.jobPostingId) {
        const posting = await ctx.db.get(app.jobPostingId);
        if (posting) {
          jobTitle = posting.title;
          const owner = await ctx.db.get(posting.ownerId);
          companyName = owner?.fullName?.trim() || 'HDP Partner';
        }
      }
      results.push({
        id: app._id.toString(),
        jobTitle,
        companyName,
        stage: app.stage,
        appliedAt: app.createdAt,
      });
    }
    return results.sort((a, b) => b.appliedAt - a.appliedAt);
  },
});

const careerProfileSnapshotValidator = v.object({
  location: v.optional(v.string()),
  skills: v.array(v.object({ name: v.string(), level: v.number() })),
  education: v.array(v.object({ school: v.string(), degree: v.string(), year: v.string() })),
  experience: v.array(
    v.object({ company: v.string(), role: v.string(), period: v.string(), description: v.string() })
  ),
  languages: v.array(v.object({ name: v.string(), level: v.string() })),
  certificates: v.array(v.object({ name: v.string(), issuer: v.string(), year: v.string() })),
});

export const getApplicationDetail = query({
  args: {
    email: v.string(),
    applicationId: v.id('recruitmentCandidates'),
  },
  returns: v.union(
    v.null(),
    v.object({
      id: v.string(),
      jobTitle: v.string(),
      companyName: v.string(),
      department: v.optional(v.string()),
      location: v.optional(v.string()),
      stage: recruitmentStageValidator,
      score: v.number(),
      jobExternalId: v.optional(v.string()),
      appliedAt: v.number(),
      updatedAt: v.number(),
      stageEvents: v.array(stageEventValidator),
    })
  ),
  handler: async (ctx, args) => {
    const user = await requireOwner(ctx, args.email);
    const application = await ctx.db.get(args.applicationId);
    if (!application || application.applicantUserId !== user._id) return null;

    let jobTitle = application.position;
    let companyName = '—';
    let department: string | undefined;
    let location: string | undefined;
    let jobExternalId: string | undefined;

    if (application.jobPostingId) {
      const posting = await ctx.db.get(application.jobPostingId);
      if (posting) {
        jobTitle = posting.title;
        department = posting.department;
        location = posting.location;
        jobExternalId = posting.externalId;
        const owner = await ctx.db.get(posting.ownerId);
        companyName = owner?.fullName?.trim() || 'HDP Partner';
      }
    }

    return {
      id: application._id.toString(),
      jobTitle,
      companyName,
      department,
      location,
      stage: application.stage,
      score: application.score,
      jobExternalId,
      appliedAt: application.createdAt,
      updatedAt: application.updatedAt,
      stageEvents: await listStageEventsForCandidate(ctx, args.applicationId),
    };
  },
});

export const getCandidateDetail = query({
  args: {
    email: v.string(),
    candidateId: v.id('recruitmentCandidates'),
  },
  returns: v.union(
    v.null(),
    v.object({
      id: v.string(),
      name: v.string(),
      position: v.string(),
      stage: recruitmentStageValidator,
      score: v.number(),
      notes: v.optional(v.string()),
      appliedAt: v.number(),
      updatedAt: v.number(),
      jobTitle: v.optional(v.string()),
      jobDepartment: v.optional(v.string()),
      applicantEmail: v.optional(v.string()),
      careerProfile: v.optional(careerProfileSnapshotValidator),
      stageEvents: v.array(stageEventValidator),
    })
  ),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const candidate = await ctx.db.get(args.candidateId);
    if (!candidate || candidate.ownerId !== owner._id) return null;

    let jobTitle: string | undefined;
    let jobDepartment: string | undefined;
    if (candidate.jobPostingId) {
      const posting = await ctx.db.get(candidate.jobPostingId);
      if (posting) {
        jobTitle = posting.title;
        jobDepartment = posting.department;
      }
    }

    let applicantEmail: string | undefined;
    let careerProfile:
      | {
          location?: string;
          skills: { name: string; level: number }[];
          education: { school: string; degree: string; year: string }[];
          experience: { company: string; role: string; period: string; description: string }[];
          languages: { name: string; level: string }[];
          certificates: { name: string; issuer: string; year: string }[];
        }
      | undefined;

    if (candidate.applicantUserId) {
      const applicant = await ctx.db.get(candidate.applicantUserId);
      applicantEmail = applicant?.email;
      const profile = await ctx.db
        .query('careerProfiles')
        .withIndex('by_userId', (q) => q.eq('userId', candidate.applicantUserId!))
        .first();
      if (profile) {
        careerProfile = {
          location: profile.location,
          skills: profile.skills,
          education: profile.education,
          experience: profile.experience,
          languages: profile.languages,
          certificates: profile.certificates,
        };
      }
    }

    return {
      id: candidate._id.toString(),
      name: candidate.name,
      position: candidate.position,
      stage: candidate.stage,
      score: candidate.score,
      notes: candidate.notes,
      appliedAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
      jobTitle,
      jobDepartment,
      applicantEmail,
      careerProfile,
      stageEvents: await listStageEventsForCandidate(ctx, args.candidateId),
    };
  },
});

export const updateCandidateNotes = mutation({
  args: {
    email: v.string(),
    candidateId: v.id('recruitmentCandidates'),
    notes: v.string(),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const candidate = await ctx.db.get(args.candidateId);
    if (!candidate || candidate.ownerId !== owner._id) throw new Error('Candidate not found.');
    await ctx.db.patch(args.candidateId, {
      notes: args.notes.trim() || undefined,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const createEmployee = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    employeeEmail: v.optional(v.string()),
    department: v.string(),
    role: v.string(),
    joinDate: v.optional(v.string()),
    status: v.optional(v.union(v.literal('active'), v.literal('on_leave'))),
  },
  returns: v.object({ id: v.string() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const now = Date.now();
    const id = await ctx.db.insert('hrEmployees', {
      ownerId: owner._id,
      name: args.name.trim(),
      email: args.employeeEmail?.trim().toLowerCase() || undefined,
      department: args.department.trim(),
      role: args.role.trim(),
      joinDate: args.joinDate?.trim() || new Date().toISOString().slice(0, 10),
      status: args.status ?? 'active',
      createdAt: now,
      updatedAt: now,
    });
    return { id: id.toString() };
  },
});

export const createDepartment = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    head: v.string(),
    employees: v.optional(v.number()),
  },
  returns: v.object({ id: v.string() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const now = Date.now();
    const id = await ctx.db.insert('hrDepartments', {
      ownerId: owner._id,
      name: args.name.trim(),
      head: args.head.trim(),
      employees: args.employees ?? 0,
      createdAt: now,
      updatedAt: now,
    });
    return { id: id.toString() };
  },
});

export const createReview = mutation({
  args: {
    email: v.string(),
    employee: v.string(),
    period: v.string(),
    rating: v.number(),
  },
  returns: v.object({ id: v.string() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const now = Date.now();
    const id = await ctx.db.insert('hrReviews', {
      ownerId: owner._id,
      employee: args.employee.trim(),
      period: args.period.trim(),
      rating: Math.min(5, Math.max(1, args.rating)),
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    });
    return { id: id.toString() };
  },
});

export const createInternalCourse = mutation({
  args: {
    email: v.string(),
    title: v.string(),
    capacity: v.number(),
    compliance: v.optional(v.boolean()),
  },
  returns: v.object({ id: v.string() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const now = Date.now();
    const id = await ctx.db.insert('internalCourses', {
      ownerId: owner._id,
      title: args.title.trim(),
      enrolled: 0,
      completed: 0,
      compliance: args.compliance ?? false,
      createdAt: now,
      updatedAt: now,
    });
    return { id: id.toString() };
  },
});

export const upsertEmployeeProgress = mutation({
  args: {
    email: v.string(),
    employeeName: v.string(),
    progress: v.number(),
  },
  returns: v.object({ id: v.string() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const now = Date.now();
    const existing = await ctx.db
      .query('internalEmployeeProgress')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', owner._id))
      .collect();
    const match = existing.find((row) => row.employeeName === args.employeeName.trim());
    if (match) {
      await ctx.db.patch(match._id, {
        progress: Math.min(100, Math.max(0, args.progress)),
        updatedAt: now,
      });
      return { id: match._id.toString() };
    }
    const id = await ctx.db.insert('internalEmployeeProgress', {
      ownerId: owner._id,
      employeeName: args.employeeName.trim(),
      progress: Math.min(100, Math.max(0, args.progress)),
      createdAt: now,
      updatedAt: now,
    });
    return { id: id.toString() };
  },
});

export const seedEmployerEcosystem = mutation({
  args: { email: v.string() },
  returns: v.object({ seeded: v.boolean() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const existing = await ctx.db
      .query('recruitmentJobPostings')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', owner._id))
      .first();
    if (existing) return { seeded: false };

    const now = Date.now();
    const jobId = await ctx.db.insert('recruitmentJobPostings', {
      ownerId: owner._id,
      externalId: `manufacturing-interpreter-${now}`,
      title: 'Manufacturing Korean Interpreter',
      department: 'Operations',
      location: 'Ho Chi Minh City',
      description: 'Support Korean-Vietnamese communication on the factory floor.',
      salary: '15–20M VND',
      applicants: 1,
      status: 'open',
      postedAt: new Date().toISOString().slice(0, 10),
      createdAt: now,
      updatedAt: now,
    });

    const candidateId = await ctx.db.insert('recruitmentCandidates', {
      ownerId: owner._id,
      jobPostingId: jobId,
      name: 'Sample Applicant',
      position: 'Manufacturing Korean Interpreter',
      stage: 'screening',
      score: 78,
      createdAt: now,
      updatedAt: now,
    });
    await insertStageEvent(ctx, {
      candidateId,
      toStage: 'applied',
      actorUserId: owner._id,
      createdAt: now,
    });
    await insertStageEvent(ctx, {
      candidateId,
      fromStage: 'applied',
      toStage: 'screening',
      actorUserId: owner._id,
      createdAt: now + 1,
    });

    await ctx.db.insert('hrEmployees', {
      ownerId: owner._id,
      name: 'Nguyen Van A',
      department: 'HR',
      role: 'HR Specialist',
      joinDate: new Date().toISOString().slice(0, 10),
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('internalCourses', {
      ownerId: owner._id,
      title: 'Workplace Korean Basics',
      enrolled: 12,
      completed: 5,
      compliance: true,
      createdAt: now,
      updatedAt: now,
    });

    return { seeded: true };
  },
});

export const completeReview = mutation({
  args: {
    email: v.string(),
    reviewId: v.id('hrReviews'),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const review = await ctx.db.get(args.reviewId);
    if (!review || review.ownerId !== owner._id) throw new Error('Review not found.');
    await ctx.db.patch(args.reviewId, { status: 'completed', updatedAt: Date.now() });
    return { success: true };
  },
});

export const assignPlatformCourseToEmployee = mutation({
  args: {
    email: v.string(),
    employeeId: v.id('hrEmployees'),
    courseSlug: v.string(),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const employee = await ctx.db.get(args.employeeId);
    if (!employee || employee.ownerId !== owner._id) throw new Error('Employee not found.');
    const course = await ctx.db
      .query('courses')
      .filter((q) => q.eq(q.field('slug'), args.courseSlug.trim()))
      .first();
    if (!course) throw new Error('Course not found.');
    const now = Date.now();
    const existing = await ctx.db
      .query('internalEmployeeProgress')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', owner._id))
      .collect();
    const match = existing.find(
      (row) => row.employeeId === args.employeeId && row.platformCourseSlug === course.slug
    );
    let progress = 0;
    if (employee.email) {
      const employeeUser = await ctx.db
        .query('users')
        .withIndex('by_email', (q) => q.eq('email', employee.email!.trim().toLowerCase()))
        .first();
      if (employeeUser) {
        const userProgress = await ctx.db
          .query('userCourseProgress')
          .withIndex('by_user_course', (q) =>
            q.eq('userId', employeeUser._id).eq('courseId', course._id)
          )
          .first();
        if (userProgress) {
          progress =
            userProgress.totalLectures > 0
              ? Math.round((userProgress.completedLectures / userProgress.totalLectures) * 100)
              : 0;
        } else {
          await ctx.db.insert('userCourseProgress', {
            userId: employeeUser._id,
            courseId: course._id,
            completedLectures: 0,
            totalLectures: course.totalVideos ?? 0,
            lastUpdated: now,
          });
        }
      }
    }

    if (match) {
      await ctx.db.patch(match._id, { progress, updatedAt: now });
      return { success: true };
    }
    await ctx.db.insert('internalEmployeeProgress', {
      ownerId: owner._id,
      employeeName: employee.name,
      employeeId: args.employeeId,
      platformCourseSlug: course.slug,
      progress,
      createdAt: now,
      updatedAt: now,
    });
    return { success: true };
  },
});

export const saveJobPosting = mutation({
  args: {
    email: v.string(),
    jobPostingId: v.id('recruitmentJobPostings'),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const existing = await ctx.db
      .query('savedJobPostings')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();
    if (existing.some((row) => row.jobPostingId === args.jobPostingId)) {
      return { success: true };
    }
    await ctx.db.insert('savedJobPostings', {
      userId: user._id,
      jobPostingId: args.jobPostingId,
      createdAt: Date.now(),
    });
    return { success: true };
  },
});

export const unsaveJobPosting = mutation({
  args: {
    email: v.string(),
    jobPostingId: v.id('recruitmentJobPostings'),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const rows = await ctx.db
      .query('savedJobPostings')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();
    for (const row of rows) {
      if (row.jobPostingId === args.jobPostingId) {
        await ctx.db.delete(row._id);
      }
    }
    return { success: true };
  },
});

export const listSavedJobsForUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const saved = await ctx.db
      .query('savedJobPostings')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();
    const jobs = [];
    for (const row of saved) {
      const job = await ctx.db.get(row.jobPostingId);
      if (!job || job.status !== 'open') continue;
      jobs.push({
        id: job._id.toString(),
        externalId: job.externalId,
        title: job.title,
        department: job.department,
        label: `${job.title} · ${job.department}`,
      });
    }
    return jobs;
  },
});

export const isJobSaved = query({
  args: {
    email: v.string(),
    jobPostingId: v.id('recruitmentJobPostings'),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const rows = await ctx.db
      .query('savedJobPostings')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();
    return rows.some((row) => row.jobPostingId === args.jobPostingId);
  },
});

export const backfillJobPostingExternalIds = mutation({
  args: {},
  returns: v.object({ updated: v.number() }),
  handler: async (ctx) => {
    const postings = await ctx.db.query('recruitmentJobPostings').collect();
    let updated = 0;
    for (const posting of postings) {
      if (posting.externalId?.trim()) continue;
      const externalId = posting._id.toString();
      await ctx.db.patch(posting._id, { externalId, updatedAt: Date.now() });
      updated += 1;
    }
    return { updated };
  },
});

export const backfillRecruitmentStageEvents = mutation({
  args: { adminEmail: v.optional(v.string()) },
  returns: v.object({ candidatesProcessed: v.number(), eventsInserted: v.number() }),
  handler: async (ctx, args) => {
    if (args.adminEmail) {
      const admin = await ctx.db
        .query('users')
        .withIndex('by_email', (q) => q.eq('email', args.adminEmail!.trim().toLowerCase()))
        .first();
      if (!admin || admin.role !== 'admin') throw new Error('Unauthorized.');
    }

    const candidates = await ctx.db.query('recruitmentCandidates').collect();
    let eventsInserted = 0;

    for (const candidate of candidates) {
      const existing = await ctx.db
        .query('recruitmentStageEvents')
        .withIndex('by_candidateId_createdAt', (q) => q.eq('candidateId', candidate._id))
        .first();
      if (existing) continue;

      await insertStageEvent(ctx, {
        candidateId: candidate._id,
        toStage: 'applied',
        createdAt: candidate.createdAt,
      });
      eventsInserted += 1;

      if (candidate.stage !== 'applied') {
        await insertStageEvent(ctx, {
          candidateId: candidate._id,
          fromStage: 'applied',
          toStage: candidate.stage,
          createdAt: candidate.updatedAt,
        });
        eventsInserted += 1;
      }
    }

    return { candidatesProcessed: candidates.length, eventsInserted };
  },
});

export const listStageEventsForCandidateQuery = query({
  args: {
    email: v.string(),
    candidateId: v.id('recruitmentCandidates'),
  },
  returns: v.array(stageEventValidator),
  handler: async (ctx, args) => {
    const user = await requireOwner(ctx, args.email);
    const candidate = await ctx.db.get(args.candidateId);
    if (!candidate) return [];
    const isApplicant = candidate.applicantUserId === user._id;
    const isOwner = candidate.ownerId === user._id;
    if (!isApplicant && !isOwner) return [];
    return listStageEventsForCandidate(ctx, args.candidateId);
  },
});
