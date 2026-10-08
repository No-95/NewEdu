import type { Metadata } from 'next';

import { ExpertPublicProfileClient } from '@/components/ecosystem/experts/ExpertPublicProfileClient';
import { getAuthenticatedSession } from '@/lib/auth';
import { api } from '@/convex/_generated/api';
import { buildMetadata, seoQuery } from '@/lib/seo';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const expert = await seoQuery((convex) =>
    convex.query(api.experts.getExpertByUserId, { userId: id }),
  );

  if (!expert) {
    return buildMetadata({
      title: 'Chuyên gia HDP EDU',
      description:
        'Hồ sơ chuyên gia HDP EDU: chuyên môn về tiếng Hàn sản xuất, tuyển dụng, nhân sự và đào tạo cho doanh nghiệp Hàn–Việt.',
      path: `/experts/${id}`,
      index: false,
    });
  }

  const fields = expert.expertise.length ? expert.expertise.join(', ') : expert.industries.join(', ');
  return buildMetadata({
    title: `${expert.displayName} — Chuyên gia HDP EDU`,
    description: expert.bio || `${expert.headline}${fields ? ` Chuyên môn: ${fields}.` : ''}`,
    path: `/experts/${id}`,
  });
}

export default async function ExpertProfilePage({ params }: PageProps) {
  const { id } = await params;
  const session = await getAuthenticatedSession();
  return <ExpertPublicProfileClient expertUserId={id} userEmail={session?.user.email} />;
}
