import { mutation, query } from './_generated/server';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';

const LEAD_STAGES = [
  'new_lead',
  'contacted',
  'interested',
  'trial_class',
  'enrolled',
] as const;

type LeadStage = (typeof LEAD_STAGES)[number];

const leadStageValidator = v.union(
  v.literal('new_lead'),
  v.literal('contacted'),
  v.literal('interested'),
  v.literal('trial_class'),
  v.literal('enrolled')
);

async function requireOwner(ctx: QueryCtx | MutationCtx, email: string) {
  const user = await ctx.db
    .query('users')
    .withIndex('by_email', (q) => q.eq('email', email.trim().toLowerCase()))
    .first();
  if (!user) throw new Error('User not found.');
  return user;
}

async function requireOwnedStudent(ctx: MutationCtx, ownerId: Id<'users'>, studentId: Id<'trainingStudents'>) {
  const student = await ctx.db.get(studentId);
  if (!student || student.ownerId !== ownerId) throw new Error('Student not found.');
  return student;
}

async function requireOwnedLead(ctx: MutationCtx, ownerId: Id<'users'>, leadId: Id<'crmLeads'>) {
  const lead = await ctx.db.get(leadId);
  if (!lead || lead.ownerId !== ownerId) throw new Error('Lead not found.');
  return lead;
}

async function requireOwnedClass(ctx: MutationCtx, ownerId: Id<'users'>, classId: Id<'trainingClasses'>) {
  const cls = await ctx.db.get(classId);
  if (!cls || cls.ownerId !== ownerId) throw new Error('Class not found.');
  return cls;
}

function nextLeadStage(stage: LeadStage): LeadStage | null {
  const index = LEAD_STAGES.indexOf(stage);
  if (index < 0 || index >= LEAD_STAGES.length - 1) return null;
  return LEAD_STAGES[index + 1];
}

export const createStudent = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    studentEmail: v.string(),
    className: v.string(),
  },
  returns: v.object({ id: v.string() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const now = Date.now();
    const id = await ctx.db.insert('trainingStudents', {
      ownerId: owner._id,
      name: args.name.trim(),
      email: args.studentEmail.trim().toLowerCase(),
      className: args.className.trim(),
      status: 'active',
      attendanceRate: 0,
      createdAt: now,
      updatedAt: now,
    });
    return { id: id.toString() };
  },
});

export const updateStudent = mutation({
  args: {
    email: v.string(),
    studentId: v.id('trainingStudents'),
    name: v.optional(v.string()),
    studentEmail: v.optional(v.string()),
    className: v.optional(v.string()),
    status: v.optional(v.union(v.literal('active'), v.literal('inactive'), v.literal('graduated'))),
    attendanceRate: v.optional(v.number()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    await requireOwnedStudent(ctx, owner._id, args.studentId);
    const patch: Partial<Doc<'trainingStudents'>> = { updatedAt: Date.now() };
    if (args.name !== undefined) patch.name = args.name.trim();
    if (args.studentEmail !== undefined) patch.email = args.studentEmail.trim().toLowerCase();
    if (args.className !== undefined) patch.className = args.className.trim();
    if (args.status !== undefined) patch.status = args.status;
    if (args.attendanceRate !== undefined) patch.attendanceRate = args.attendanceRate;
    await ctx.db.patch(args.studentId, patch);
    return { success: true };
  },
});

export const createClass = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    teacher: v.string(),
    schedule: v.string(),
    capacity: v.number(),
  },
  returns: v.object({ id: v.string() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const now = Date.now();
    const id = await ctx.db.insert('trainingClasses', {
      ownerId: owner._id,
      name: args.name.trim(),
      teacher: args.teacher.trim(),
      schedule: args.schedule.trim(),
      students: 0,
      capacity: Math.max(1, args.capacity),
      completionRate: 0,
      createdAt: now,
      updatedAt: now,
    });
    return { id: id.toString() };
  },
});

export const updateClass = mutation({
  args: {
    email: v.string(),
    classId: v.id('trainingClasses'),
    name: v.optional(v.string()),
    teacher: v.optional(v.string()),
    schedule: v.optional(v.string()),
    capacity: v.optional(v.number()),
    completionRate: v.optional(v.number()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    await requireOwnedClass(ctx, owner._id, args.classId);
    const patch: Partial<Doc<'trainingClasses'>> = { updatedAt: Date.now() };
    if (args.name !== undefined) patch.name = args.name.trim();
    if (args.teacher !== undefined) patch.teacher = args.teacher.trim();
    if (args.schedule !== undefined) patch.schedule = args.schedule.trim();
    if (args.capacity !== undefined) patch.capacity = Math.max(1, args.capacity);
    if (args.completionRate !== undefined) patch.completionRate = args.completionRate;
    await ctx.db.patch(args.classId, patch);
    return { success: true };
  },
});

export const createTrainingTeacher = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    subject: v.string(),
  },
  returns: v.object({ id: v.string() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const now = Date.now();
    const id = await ctx.db.insert('trainingTeachers', {
      ownerId: owner._id,
      name: args.name.trim(),
      subject: args.subject.trim(),
      classes: 0,
      students: 0,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });
    return { id: id.toString() };
  },
});

export const createLead = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    phone: v.string(),
    source: v.string(),
    leadEmail: v.optional(v.string()),
    followUpDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.object({ id: v.string() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const now = Date.now();
    const id = await ctx.db.insert('crmLeads', {
      ownerId: owner._id,
      name: args.name.trim(),
      phone: args.phone.trim(),
      source: args.source.trim(),
      stage: 'new_lead',
      followUpDate: args.followUpDate?.trim() || new Date().toISOString().slice(0, 10),
      email: args.leadEmail?.trim().toLowerCase(),
      notes: args.notes?.trim() || '',
      createdAt: now,
      updatedAt: now,
    });
    return { id: id.toString() };
  },
});

export const updateLeadStage = mutation({
  args: {
    email: v.string(),
    leadId: v.id('crmLeads'),
    stage: leadStageValidator,
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const lead = await requireOwnedLead(ctx, owner._id, args.leadId);
    const now = Date.now();
    await ctx.db.patch(args.leadId, { stage: args.stage, updatedAt: now });

    if (args.stage === 'enrolled') {
      const existing = await ctx.db
        .query('trainingStudents')
        .withIndex('by_ownerId', (q) => q.eq('ownerId', owner._id))
        .collect();
      const alreadyEnrolled = existing.some(
        (s) => s.email === (lead.email ?? '') || s.name === lead.name
      );
      if (!alreadyEnrolled) {
        const studentEmail =
          lead.email?.trim() ||
          `${lead.phone.replace(/\D/g, '') || 'lead'}@lead.hdp.edu`;
        await ctx.db.insert('trainingStudents', {
          ownerId: owner._id,
          name: lead.name,
          email: studentEmail.toLowerCase(),
          className: 'Unassigned',
          status: 'active',
          attendanceRate: 0,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return { success: true };
  },
});

export const advanceLeadStage = mutation({
  args: {
    email: v.string(),
    leadId: v.id('crmLeads'),
  },
  returns: v.object({ stage: v.union(leadStageValidator, v.null()) }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const lead = await requireOwnedLead(ctx, owner._id, args.leadId);
    const next = nextLeadStage(lead.stage);
    if (!next) return { stage: null };

    const now = Date.now();
    await ctx.db.patch(args.leadId, { stage: next, updatedAt: now });

    if (next === 'enrolled') {
      const existing = await ctx.db
        .query('trainingStudents')
        .withIndex('by_ownerId', (q) => q.eq('ownerId', owner._id))
        .collect();
      const alreadyEnrolled = existing.some(
        (s) => s.email === (lead.email ?? '') || s.name === lead.name
      );
      if (!alreadyEnrolled) {
        const studentEmail =
          lead.email?.trim() ||
          `${lead.phone.replace(/\D/g, '') || 'lead'}@lead.hdp.edu`;
        await ctx.db.insert('trainingStudents', {
          ownerId: owner._id,
          name: lead.name,
          email: studentEmail.toLowerCase(),
          className: 'Unassigned',
          status: 'active',
          attendanceRate: 0,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return { stage: next };
  },
});

export const updateLeadFollowUp = mutation({
  args: {
    email: v.string(),
    leadId: v.id('crmLeads'),
    followUpDate: v.string(),
    notes: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    await requireOwnedLead(ctx, owner._id, args.leadId);
    await ctx.db.patch(args.leadId, {
      followUpDate: args.followUpDate.trim(),
      notes: args.notes?.trim(),
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const createPartner = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    type: v.string(),
    commission: v.optional(v.string()),
  },
  returns: v.object({ id: v.string() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const now = Date.now();
    const id = await ctx.db.insert('businessPartners', {
      ownerId: owner._id,
      name: args.name.trim(),
      type: args.type.trim(),
      referrals: 0,
      revenue: '0 ₫',
      commission: args.commission?.trim() || '0%',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    });
    return { id: id.toString() };
  },
});

export const createReferral = mutation({
  args: {
    email: v.string(),
    partner: v.string(),
    student: v.string(),
    amount: v.string(),
    amountValue: v.optional(v.number()),
  },
  returns: v.object({ id: v.string() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const now = Date.now();
    const id = await ctx.db.insert('businessReferrals', {
      ownerId: owner._id,
      partner: args.partner.trim(),
      student: args.student.trim(),
      date: new Date().toISOString().slice(0, 10),
      amount: args.amount.trim(),
      amountValue: args.amountValue,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    });
    return { id: id.toString() };
  },
});

export const updatePartnerStatus = mutation({
  args: {
    email: v.string(),
    partnerId: v.id('businessPartners'),
    status: v.union(v.literal('active'), v.literal('pending')),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const partner = await ctx.db.get(args.partnerId);
    if (!partner || partner.ownerId !== owner._id) throw new Error('Partner not found.');
    await ctx.db.patch(args.partnerId, { status: args.status, updatedAt: Date.now() });
    return { success: true };
  },
});

export const generateResourceUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const createTeacherResource = mutation({
  args: {
    email: v.string(),
    title: v.string(),
    fileName: v.string(),
    mimeType: v.optional(v.string()),
    storageId: v.id('_storage'),
  },
  returns: v.object({ id: v.string() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const now = Date.now();
    const id = await ctx.db.insert('teacherResources', {
      ownerId: owner._id,
      title: args.title.trim(),
      fileName: args.fileName.trim(),
      mimeType: args.mimeType,
      storageId: args.storageId,
      createdAt: now,
      updatedAt: now,
    });
    return { id: id.toString() };
  },
});

export const deleteTeacherResource = mutation({
  args: {
    email: v.string(),
    resourceId: v.id('teacherResources'),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const resource = await ctx.db.get(args.resourceId);
    if (!resource || resource.ownerId !== owner._id) throw new Error('Resource not found.');
    if (resource.storageId) {
      await ctx.storage.delete(resource.storageId);
    }
    await ctx.db.delete(args.resourceId);
    return { success: true };
  },
});

export const listTeacherResources = query({
  args: { email: v.string() },
  returns: v.array(
    v.object({
      id: v.string(),
      title: v.string(),
      fileName: v.string(),
      mimeType: v.optional(v.string()),
      url: v.union(v.string(), v.null()),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const rows = await ctx.db
      .query('teacherResources')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', owner._id))
      .collect();

    const results = [];
    for (const row of rows) {
      const url = row.storageId ? await ctx.storage.getUrl(row.storageId) : null;
      results.push({
        id: row._id.toString(),
        title: row.title,
        fileName: row.fileName,
        mimeType: row.mimeType,
        url,
        createdAt: row.createdAt,
      });
    }
    return results.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const seedTeacherEcosystem = mutation({
  args: { email: v.string() },
  returns: v.object({ seeded: v.boolean() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const existing = await ctx.db
      .query('trainingStudents')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', owner._id))
      .first();
    if (existing) return { seeded: false };

    const now = Date.now();
    await ctx.db.insert('trainingClasses', {
      ownerId: owner._id,
      name: 'Korean Basics A1',
      teacher: owner.fullName || 'Instructor',
      schedule: 'Mon/Wed 19:00',
      students: 2,
      capacity: 20,
      completionRate: 15,
      createdAt: now,
      updatedAt: now,
    });

    for (const student of [
      { name: 'Minh Anh', email: 'minh.anh@example.com', className: 'Korean Basics A1' },
      { name: 'Thanh Tung', email: 'thanh.tung@example.com', className: 'Korean Basics A1' },
    ]) {
      await ctx.db.insert('trainingStudents', {
        ownerId: owner._id,
        name: student.name,
        email: student.email,
        className: student.className,
        status: 'active',
        attendanceRate: 85,
        createdAt: now,
        updatedAt: now,
      });
    }

    await ctx.db.insert('crmLeads', {
      ownerId: owner._id,
      name: 'Lan Nguyen',
      phone: '+84901234567',
      source: 'Facebook',
      stage: 'interested',
      followUpDate: new Date().toISOString().slice(0, 10),
      email: 'lan.nguyen@example.com',
      notes: 'Interested in evening class',
      createdAt: now,
      updatedAt: now,
    });

    return { seeded: true };
  },
});

export const importStudentsBatch = mutation({
  args: {
    email: v.string(),
    rows: v.array(
      v.object({
        name: v.string(),
        studentEmail: v.string(),
        className: v.string(),
      })
    ),
  },
  returns: v.object({
    imported: v.number(),
    skipped: v.number(),
    errors: v.array(v.object({ row: v.number(), reason: v.string() })),
  }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx, args.email);
    const existing = await ctx.db
      .query('trainingStudents')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', owner._id))
      .collect();
    const existingEmails = new Set(existing.map((s) => s.email.toLowerCase()));
    const now = Date.now();
    let imported = 0;
    let skipped = 0;
    const errors: { row: number; reason: string }[] = [];

    for (let index = 0; index < args.rows.length; index += 1) {
      const row = args.rows[index];
      const rowNumber = index + 1;
      const email = row.studentEmail.trim().toLowerCase();
      const name = row.name.trim();
      const className = row.className.trim();
      if (!email || !name) {
        skipped += 1;
        errors.push({ row: rowNumber, reason: 'Missing name or email' });
        continue;
      }
      if (existingEmails.has(email)) {
        skipped += 1;
        errors.push({ row: rowNumber, reason: 'Duplicate email' });
        continue;
      }
      await ctx.db.insert('trainingStudents', {
        ownerId: owner._id,
        name,
        email,
        className: className || 'General',
        status: 'active',
        attendanceRate: 0,
        createdAt: now,
        updatedAt: now,
      });
      existingEmails.add(email);
      imported += 1;
    }

    return { imported, skipped, errors };
  },
});
