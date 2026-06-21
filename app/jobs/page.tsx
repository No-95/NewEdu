import { cookies } from 'next/headers';
import { CareerJobsClient } from '@/components/ecosystem/career/CareerJobsClient';

export default async function JobsPage() {
  const cookieStore = await cookies();
  const userEmail = cookieStore.get('user_email')?.value ?? null;

  return <CareerJobsClient userEmail={userEmail} />;
}
