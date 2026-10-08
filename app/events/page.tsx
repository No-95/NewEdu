import { cookies } from 'next/headers';
import { EventsNewsClient } from '@/components/events/EventsNewsClient';
import type { Metadata } from 'next';

export default async function EventsPage() {
  const cookieStore = await cookies();
  const userEmail = cookieStore.get('user_email')?.value ?? null;

  return <EventsNewsClient userEmail={userEmail} />;
}

export const metadata: Metadata = {
  title: "Tin tức & sự kiện tiếng Hàn sản xuất",
  description: "Tin tức và sự kiện về tiếng Hàn sản xuất, việc làm và đời sống lao động Việt tại Hàn Quốc, cập nhật bởi HDP EDU.",
  alternates: { canonical: 'https://hdpedu.com/events' },
  robots: { index: true, follow: true },
}
