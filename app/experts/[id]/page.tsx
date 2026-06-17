import { ExpertPublicProfileClient } from '@/components/ecosystem/experts/ExpertPublicProfileClient';
import { getAuthenticatedSession } from '@/lib/auth';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ExpertProfilePage({ params }: PageProps) {
  const { id } = await params;
  const session = await getAuthenticatedSession();
  return <ExpertPublicProfileClient expertUserId={id} userEmail={session?.user.email} />;
}
