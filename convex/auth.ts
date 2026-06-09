import { action, internalMutation, mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const storeOtpSession = internalMutation({
  args: {
    email: v.string(),
    otpHash: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('otpSessions')
      .withIndex('by_email_expiresAt', (q) => q.eq('email', args.email))
      .collect();

    await Promise.all(existing.map((session) => ctx.db.delete(session._id)));

    await ctx.db.insert('otpSessions', {
      email: args.email,
      otpHash: args.otpHash,
      expiresAt: args.expiresAt,
      createdAt: args.createdAt,
    });

    return null;
  },
});

export const sendOtp = action({
  args: {
    email: v.string(),
  },
  returns: v.object({ message: v.string() }),
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new Error('Invalid email format.');
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is missing on server.');
    }

    const otp = generateOtp();
    const otpSecret = process.env.OTP_SIGNING_SECRET || resendApiKey;
    const otpHash = await sha256Hex(`${normalizedEmail}:${otp}:${otpSecret}`);
    const expiresAt = Date.now() + 10 * 60 * 1000;

    await ctx.runMutation(internal.auth.storeOtpSession, {
      email: normalizedEmail,
      otpHash,
      expiresAt,
      createdAt: Date.now(),
    });

    const from = process.env.RESEND_FROM_EMAIL || 'HDP EDU <onboarding@resend.dev>';
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: normalizedEmail,
        subject: 'Your HDP EDU OTP Code',
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.5">
            <h2>HDP EDU OTP Verification</h2>
            <p>Your OTP code is:</p>
            <p style="font-size:28px;font-weight:700;letter-spacing:4px">${otp}</p>
            <p>This code expires in 10 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const allowDevOtpFallback = process.env.AUTH_DEV_OTP_FALLBACK === 'true';

      // In non-production environments, allow OTP flow to continue even if email delivery fails.
      // This keeps local/dev sign-up unblocked when provider sandbox rules are active.
      if (allowDevOtpFallback || process.env.NODE_ENV !== 'production') {
        return {
          message: `OTP delivery is restricted in dev mode. Use this OTP: ${otp}`,
        };
      }

      throw new Error(`Failed to send OTP email: ${errorText}`);
    }

    return { message: 'OTP sent successfully.' };
  },
});

export const verifyOtp = mutation({
  args: {
    email: v.string(),
    otp: v.string(),
  },
  returns: v.object({ verified: v.boolean() }),
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();
    const normalizedOtp = args.otp.trim();

    if (!/^\d{6}$/.test(normalizedOtp)) {
      throw new Error('OTP must be 6 digits.');
    }

    const otpSecret = process.env.OTP_SIGNING_SECRET || process.env.RESEND_API_KEY;
    if (!otpSecret) {
      throw new Error('Server OTP secret is missing.');
    }

    const sessions = await ctx.db
      .query('otpSessions')
      .withIndex('by_email', (q) => q.eq('email', normalizedEmail))
      .collect();

    const activeSession = sessions
      .filter((session) => session.expiresAt > Date.now())
      .sort((left, right) => right.createdAt - left.createdAt)[0];

    if (!activeSession) {
      throw new Error('No OTP session found.');
    }

    const computedHash = await sha256Hex(`${normalizedEmail}:${normalizedOtp}:${otpSecret}`);
    if (computedHash !== activeSession.otpHash) {
      throw new Error('Invalid OTP.');
    }

    await ctx.db.delete(activeSession._id);
    return { verified: true };
  },
});

export const createOrUpdateUser = mutation({
  args: {
    email: v.string(),
    fullName: v.string(),
    phone: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    agreeToTerms: v.boolean(),
  },
  returns: v.object({ userId: v.string(), isNewUser: v.boolean() }),
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();
    const existing = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', normalizedEmail))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        fullName: args.fullName,
        phone: args.phone,
        passwordHash: args.passwordHash,
        agreeToTerms: args.agreeToTerms,
        emailVerified: true,
        updatedAt: now,
      });
      return { userId: existing._id.toString(), isNewUser: false };
    }

    const userId = await ctx.db.insert('users', {
      email: normalizedEmail,
      fullName: args.fullName,
      phone: args.phone,
      passwordHash: args.passwordHash,
      agreeToTerms: args.agreeToTerms,
      emailVerified: true,
      role: 'student',
      username: undefined,
      avatarUrl: undefined,
      balance: 0,
      onboardingRequired: true,
      createdAt: now,
      updatedAt: now,
    });

    return { userId: userId.toString(), isNewUser: true };
  },
});

export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.string(),
      email: v.string(),
      fullName: v.string(),
      username: v.optional(v.string()),
      avatarUrl: v.optional(v.string()),
      phone: v.optional(v.string()),
      passwordHash: v.optional(v.string()),
      balance: v.optional(v.number()),
      agreeToTerms: v.boolean(),
      emailVerified: v.boolean(),
      role: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email.trim().toLowerCase()))
      .first();

    return user
      ? {
          _id: user._id.toString(),
          email: user.email,
          fullName: user.fullName ?? '',
          username: user.username ?? undefined,
          avatarUrl: user.avatarUrl ?? undefined,
          phone: user.phone,
          passwordHash: user.passwordHash,
          balance: user.balance ?? 0,
          agreeToTerms: user.agreeToTerms ?? false,
          emailVerified: user.emailVerified ?? false,
          role: user.role ?? 'student',
          createdAt: user.createdAt ?? 0,
          updatedAt: user.updatedAt ?? 0,
        }
      : null;
  },
});

export const getSessionByEmail = query({
  args: {
    email: v.string(),
  },
  returns: v.union(
    v.object({
      user: v.object({
        _id: v.string(),
        email: v.string(),
        fullName: v.string(),
        username: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
        phone: v.optional(v.string()),
        passwordHash: v.optional(v.string()),
        balance: v.optional(v.number()),
        agreeToTerms: v.boolean(),
        emailVerified: v.boolean(),
        role: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
      }),
      onboarding: v.object({
        required: v.boolean(),
        completed: v.boolean(),
        hdpId: v.union(v.string(), v.null()),
        activeRole: v.union(v.string(), v.null()),
        roles: v.array(v.string()),
        onboardingVersion: v.union(v.number(), v.null()),
      }),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', normalizedEmail))
      .first();

    if (!user) {
      return null;
    }

    const onboarding = await ctx.db
      .query('userOnboarding')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();

    const completed = user.onboardingCompletedAt !== undefined || onboarding !== null;

    return {
      user: {
        _id: user._id.toString(),
        email: user.email,
        fullName: user.fullName ?? '',
        username: user.username ?? undefined,
        avatarUrl: user.avatarUrl ?? undefined,
        phone: user.phone,
        passwordHash: user.passwordHash,
        balance: user.balance ?? 0,
        agreeToTerms: user.agreeToTerms ?? false,
        emailVerified: user.emailVerified ?? false,
        role: user.role ?? 'student',
        createdAt: user.createdAt ?? 0,
        updatedAt: user.updatedAt ?? 0,
      },
      onboarding: {
        required: user.onboardingRequired === true,
        completed,
        hdpId: user.hdpId ?? null,
        activeRole: user.activeRole ?? null,
        roles: onboarding?.roles ?? [],
        onboardingVersion: user.onboardingVersion ?? null,
      },
    };
  },
});

export const updateUserProfile = mutation({
  args: {
    email: v.string(),
    username: v.optional(v.string()),
    fullName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', normalizedEmail))
      .first();

    if (!user) throw new Error('User not found');

    const patch: Record<string, any> = { updatedAt: Date.now() };
    if (args.username !== undefined) patch.username = args.username;
    if (args.fullName !== undefined) patch.fullName = args.fullName;
    if (args.avatarUrl !== undefined) patch.avatarUrl = args.avatarUrl;

    await ctx.db.patch(user._id, patch);
    return { success: true };
  },
});

export const addDeposit = mutation({
  args: { email: v.string(), amount: v.number() },
  returns: v.object({ success: v.boolean(), balance: v.number() }),
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', normalizedEmail))
      .first();

    if (!user) throw new Error('User not found');
    if (args.amount <= 0) throw new Error('Amount must be positive');

    const current = user.balance ?? 0;
    const next = current + args.amount;

    await ctx.db.patch(user._id, { balance: next, updatedAt: Date.now() });
    // record transaction
    await ctx.db.insert('transactions', {
      userId: user._id,
      type: 'deposit',
      amount: args.amount,
      description: 'Deposit',
      createdAt: Date.now(),
    });
    return { success: true, balance: next };
  },
});
