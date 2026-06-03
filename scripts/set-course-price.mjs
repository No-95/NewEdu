import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  console.error('NEXT_PUBLIC_CONVEX_URL is required');
  process.exit(1);
}

const slug = process.env.COURSE_SLUG || 'cam-nang-video-tieng-han-san-xuat';
const price = Number(process.env.COURSE_PRICE || '2000');
const badge = process.env.COURSE_BADGE || '2.000 ₫';

const client = new ConvexHttpClient(convexUrl);
const result = await client.mutation(api.courses.updateCoursePrice, { slug, price, badge });

if (!result) {
  console.error(`Course not found: ${slug}`);
  process.exit(1);
}

console.log(JSON.stringify(result, null, 2));
