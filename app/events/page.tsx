import { cookies } from 'next/headers';
import { EventsNewsClient } from '@/components/events/EventsNewsClient';

export default async function EventsPage() {
  const cookieStore = await cookies();
  const userEmail = cookieStore.get('user_email')?.value ?? null;

  return <EventsNewsClient userEmail={userEmail} />;
}
