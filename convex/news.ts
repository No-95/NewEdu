import { mutation, query } from './_generated/server';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
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

function slugify(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function uniqueSlug(ctx: QueryCtx, base: string) {
  let slug = base || 'article';
  let suffix = 0;

  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const existing = await ctx.db
      .query('newsArticles')
      .withIndex('by_slug', (q) => q.eq('slug', candidate))
      .first();
    if (!existing) return candidate;
    suffix += 1;
  }
}

function normalizeTags(tags: string[]) {
  return [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))].slice(0, 8);
}

export const listNewsArticles = query({
  args: {
    tag: v.optional(v.string()),
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 30;
    const articles = await ctx.db
      .query('newsArticles')
      .withIndex('by_published_publishedAt', (q) => q.eq('published', true))
      .order('desc')
      .take(100);

    const tag = args.tag?.trim().toLowerCase();
    const category = args.category?.trim().toLowerCase();
    const search = args.search?.trim().toLowerCase();

    const filtered = articles.filter((article) => {
      if (tag && !article.tags.includes(tag)) return false;
      if (category && article.category.toLowerCase() !== category) return false;
      if (!search) return true;
      const haystack = `${article.title} ${article.excerpt} ${article.body} ${article.tags.join(' ')}`.toLowerCase();
      return haystack.includes(search);
    });

    return filtered.slice(0, limit).map((article) => ({
      id: article._id.toString(),
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      category: article.category,
      tags: article.tags,
      coverImage: article.coverImage,
      authorName: article.authorName,
      publishedAt: article.publishedAt,
    }));
  },
});

export const getNewsBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const article = await ctx.db
      .query('newsArticles')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();

    if (!article || !article.published) {
      return null;
    }

    return {
      id: article._id.toString(),
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      body: article.body,
      category: article.category,
      tags: article.tags,
      coverImage: article.coverImage,
      authorName: article.authorName,
      publishedAt: article.publishedAt,
    };
  },
});

export const listNewsCategories = query({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db
      .query('newsArticles')
      .withIndex('by_published_publishedAt', (q) => q.eq('published', true))
      .collect();

    const counts = new Map<string, number>();
    for (const article of articles) {
      const key = article.category.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return [...counts.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
  },
});

export const createNewsArticle = mutation({
  args: {
    email: v.string(),
    title: v.string(),
    excerpt: v.string(),
    body: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    const title = args.title.trim();
    const excerpt = args.excerpt.trim();
    const body = args.body.trim();
    const category = args.category.trim().toLowerCase() || 'news';

    if (!title || !excerpt || !body) {
      throw new Error('Title, excerpt, and body are required.');
    }

    const now = Date.now();
    const slug = await uniqueSlug(ctx, slugify(title));

    const id = await ctx.db.insert('newsArticles', {
      slug,
      title,
      excerpt,
      body,
      category,
      tags: normalizeTags(args.tags),
      coverImage: args.coverImage?.trim() || undefined,
      authorId: user._id,
      authorName: user.fullName?.trim() || user.name?.trim() || user.email.split('@')[0],
      published: true,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return { id: id.toString(), slug };
  },
});

const EDITORIAL_EMAIL = 'editorial@hdpedu.com';
const EDITORIAL_NAME = 'HDP EDU Editorial Team';

const SEED_NEWS_ARTICLES = [
  {
    slug: 'hdp-edu-ecosystem-official-launch',
    title: 'HDP EDU Officially Launches Its Vietnam–Korea Learning & Career Ecosystem',
    excerpt:
      'HDP EDU debuts a unified platform connecting Korean language learning, career pathways, business services, and community — built for the Vietnam–Korea workforce.',
    category: 'announcements',
    tags: ['hdp-edu', 'ecosystem', 'vietnam-korea', 'launch'],
    coverImage: '/homepage/hero1.png',
    publishedAt: new Date('2026-06-10T09:00:00+07:00').getTime(),
    body: `HDP EDU is proud to announce the official launch of its integrated learning and career ecosystem at hdpedu.com — a platform designed to serve learners, professionals, educators, and enterprises across the Vietnam–Korea corridor.

Unlike standalone course sites or job boards, HDP EDU brings learning, careers, business development, expert networks, and community into one coherent experience. Users can study Korean for manufacturing and professional contexts, explore career opportunities, connect with partner businesses, and engage with a growing Vietnam–Korea community — all from a single account.

The platform reflects the strategic vision of HDP Holdings, whose leadership has long advocated for practical bridges between education, employment, and international cooperation. HDP EDU operationalizes that vision: knowledge that leads to opportunity, and opportunity that rewards sustained learning.

Key pillars now live on the platform include structured video courses (including specialized Korean for manufacturing), career support and job discovery, business HR and recruitment tools, an expert network, community forums, and a dedicated news & events hub.

"We built HDP EDU because the Vietnam–Korea story is not only about language — it is about careers, trust, and long-term partnership," said the HDP EDU team. "Our goal is to help every learner and professional move from intent to outcome with clarity and support."

Registration is open to all. Explore the ecosystem, enroll in courses, and follow news and events to stay informed about upcoming programs and partnerships.`,
  },
  {
    slug: 'hdp-holdings-strategic-advisory-k-fdi-vietnam',
    title: 'HDP Holdings Strengthens Strategic Advisory for Korean FDI Enterprises in Vietnam',
    excerpt:
      'HDP Holdings expands consulting services for Korean and international investors — market entry, workforce strategy, and cross-border business development.',
    category: 'partnerships',
    tags: ['hdp-holdings', 'k-fdi', 'consulting', 'vietnam-korea'],
    coverImage: '/homepage/section22.png',
    publishedAt: new Date('2026-06-02T10:00:00+07:00').getTime(),
    body: `HDP Holdings, a strategic consulting firm led by CEO Duong Thu Huong, is deepening its advisory footprint for Korean foreign direct investment (FDI) and broader international enterprises operating in Vietnam.

With an MBA from Soongsil University (Korea) and extensive experience advising business associations and investment promotion agencies, Ms. Duong has built HDP Holdings around a simple principle: sustainable market success requires aligned strategy, capable people, and trusted local partnerships.

The firm's expanded service portfolio includes:
• Market entry and localization strategy for Korean manufacturers and service companies
• Workforce planning, training roadmaps, and talent pipeline development
• Government and association liaison support across Vietnam and Korea
• Executive briefings and cross-cultural business facilitation

HDP Holdings works closely with HDP EDU to ensure advisory recommendations translate into executable training and hiring outcomes — closing the gap between boardroom strategy and shop-floor readiness.

"Consulting without capability building is incomplete," noted HDP Holdings leadership. "Our clients need partners who understand both the regulatory landscape and the human capital reality on the ground."

Organizations interested in strategic advisory or partnership discussions may reach the team through hdpedu.com/contact-us.`,
  },
  {
    slug: 'vietnam-korea-career-connect-webinar-june-2026',
    title: 'Register Now: Vietnam–Korea Career Connect Webinar — June 25, 2026',
    excerpt:
      'Join HDP EDU and HDP Holdings for a live session on language skills, TOPIK preparation, and career pathways in manufacturing and professional services.',
    category: 'events',
    tags: ['webinar', 'careers', 'topik', 'manufacturing'],
    coverImage: '/homepage/section23.png',
    publishedAt: new Date('2026-05-25T14:00:00+07:00').getTime(),
    body: `HDP EDU and HDP Holdings invite learners, job seekers, HR professionals, and business leaders to Vietnam–Korea Career Connect — a complimentary live webinar on Wednesday, June 25, 2026, from 19:00 to 20:30 (ICT, UTC+7).

This session is designed for anyone preparing to work with Korean enterprises in Vietnam or seeking to advance within the Vietnam–Korea talent pipeline.

Agenda highlights:
• Opening remarks from HDP Holdings on workforce trends and employer expectations
• Practical Korean for manufacturing: what employers look for beyond textbook fluency
• TOPIK and structured learning paths available on HDP EDU
• Career resources: profiles, job discovery, and expert network introductions
• Live Q&A with the HDP EDU education and advisory team

Who should attend:
• Vietnamese professionals targeting roles in Korean-invested factories and offices
• HR and training managers building bilingual teams
• Students and career changers evaluating Korea-related opportunities

Registration is free. Sign in at hdpedu.com, visit the Events & News page for updates, and prepare your questions in advance. A recording summary will be published for registered participants who cannot attend live.

We look forward to connecting talent with opportunity — together.`,
  },
  {
    slug: 'topik-preparation-pathways-hdp-edu',
    title: 'New TOPIK Preparation Pathways Now Available on HDP EDU',
    excerpt:
      'Structured study tracks help learners progress from foundational Korean to exam-ready TOPIK performance — integrated with career-oriented content.',
    category: 'news',
    tags: ['topik', 'korean', 'courses', 'hdp-edu'],
    coverImage: '/homepage/section21.png',
    publishedAt: new Date('2026-05-18T11:00:00+07:00').getTime(),
    body: `HDP EDU has released updated TOPIK preparation pathways, giving learners a clearer route from beginner proficiency to exam confidence — while keeping career relevance at the center of every module.

The Test of Proficiency in Korean (TOPIK) remains a critical credential for study abroad, employment, and professional mobility in Korea-related contexts. HDP EDU's approach combines exam technique with applied vocabulary drawn from real workplace scenarios, particularly manufacturing, logistics, and office communication.

What's new:
• Modular learning paths aligned to TOPIK I and TOPIK II skill areas
• Video-led instruction with downloadable review materials
• Integration with specialized courses such as Korean for Manufacturing
• Progress tracking through the HDP EDU dashboard

Courses are developed with input from educators experienced in Vietnam–Korea training programs, ensuring content reflects both exam standards and employer expectations.

"HDP EDU is not only about passing a test," the curriculum team explained. "We want learners to walk into an interview or a factory floor conversation with confidence — because they have practiced language in context, not just in isolation."

Browse available courses at hdpedu.com/courses and combine TOPIK preparation with industry-specific modules for the strongest career profile.`,
  },
  {
    slug: 'hdp-holdings-hdp-edu-workforce-bridge',
    title: 'HDP Holdings and HDP EDU Align to Bridge Workforce Training and Enterprise Demand',
    excerpt:
      'A unified HDP strategy connects advisory expertise with digital learning — helping businesses hire, train, and retain Vietnam–Korea ready talent.',
    category: 'news',
    tags: ['hdp-holdings', 'hdp-edu', 'workforce', 'partnership'],
    coverImage: '/homepage/CTAsection.png',
    publishedAt: new Date('2026-05-10T09:30:00+07:00').getTime(),
    body: `HDP Holdings and HDP EDU today outline a coordinated strategy to address one of the most persistent challenges facing Korean FDI and Vietnamese employers alike: aligning workforce training with real hiring needs.

For years, language programs and HR departments have operated in parallel — producing graduates who excel on paper but struggle in operational environments, or employers who recruit without a clear upskilling path. The HDP group is closing that gap by design.

HDP Holdings contributes deep market intelligence, stakeholder relationships, and strategic workforce planning. HDP EDU delivers scalable digital learning, career tools, community engagement, and measurable skill development. Together, they offer end-to-end value:

For enterprises — recruitment support, internal training programs, and bilingual talent pipelines tailored to manufacturing and professional services.

For learners — credible courses, career visibility, and pathways into roles where Korean language and technical communication matter.

For the Vietnam–Korea community — a trusted platform backed by leadership with credentials and experience on both sides of the partnership.

Duong Thu Huong, Author and CEO of HDP Holdings, has authored foundational resources on Korean language for manufacturing and continues to shape the group's education-first philosophy. HDP EDU extends that philosophy to a digital scale.

"This is professional infrastructure for a professional relationship between two economies," HDP leadership stated. "We are building for the long term — with standards, accountability, and outcomes that both sides can trust."

Learn more about courses, careers, and business services at hdpedu.com.`,
  },
] as const;

async function getOrCreateEditorialAuthor(ctx: MutationCtx): Promise<{ authorId: Id<'users'>; authorName: string }> {
  const email = EDITORIAL_EMAIL.toLowerCase();
  const existing = await ctx.db
    .query('users')
    .withIndex('by_email', (q) => q.eq('email', email))
    .first();

  if (existing) {
    return {
      authorId: existing._id,
      authorName: existing.fullName?.trim() || existing.name?.trim() || EDITORIAL_NAME,
    };
  }

  const now = Date.now();
  const authorId = await ctx.db.insert('users', {
    email,
    fullName: EDITORIAL_NAME,
    name: EDITORIAL_NAME,
    role: 'admin',
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  });

  return { authorId, authorName: EDITORIAL_NAME };
}

export const seedNewsArticles = mutation({
  args: {},
  returns: v.object({
    inserted: v.number(),
    skipped: v.number(),
    slugs: v.array(v.string()),
  }),
  handler: async (ctx) => {
    const { authorId, authorName } = await getOrCreateEditorialAuthor(ctx);
    let inserted = 0;
    let skipped = 0;
    const slugs: string[] = [];

    for (const article of SEED_NEWS_ARTICLES) {
      const existing = await ctx.db
        .query('newsArticles')
        .withIndex('by_slug', (q) => q.eq('slug', article.slug))
        .first();

      if (existing) {
        skipped += 1;
        slugs.push(article.slug);
        continue;
      }

      const now = Date.now();
      await ctx.db.insert('newsArticles', {
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        body: article.body,
        category: article.category,
        tags: normalizeTags([...article.tags]),
        coverImage: article.coverImage,
        authorId,
        authorName,
        published: true,
        publishedAt: article.publishedAt,
        createdAt: now,
        updatedAt: now,
      });

      inserted += 1;
      slugs.push(article.slug);
    }

    return { inserted, skipped, slugs };
  },
});
