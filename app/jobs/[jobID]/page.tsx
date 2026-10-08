import type { Metadata } from 'next';

import { JobDetailClient } from '@/components/ecosystem/career/JobDetailClient';
import { getAuthenticatedSession } from '@/lib/auth';
import { api } from '@/convex/_generated/api';
import { buildMetadata, seoQuery } from '@/lib/seo';

type JobPageProps = {
  params: Promise<{ jobID: string }>;
};

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const { jobID } = await params;
  const job = await seoQuery((convex) =>
    convex.query(api.employerOps.getJobPostingByExternalId, { externalId: jobID }),
  );

  if (!job) {
    return buildMetadata({
      title: 'Chi tiết việc làm',
      description:
        'Chi tiết vị trí tuyển dụng tiếng Hàn tại doanh nghiệp Hàn Quốc: mô tả công việc, yêu cầu, lương và cách ứng tuyển trên HDP EDU.',
      path: `/jobs/${jobID}`,
      index: false,
    });
  }

  const company = job.companyName ? ` tại ${job.companyName}` : '';
  const salary = job.salary ? ` Lương: ${job.salary}.` : '';
  return buildMetadata({
    title: `${job.title}${company}`,
    description: `${job.title}${company}${job.location ? ` — ${job.location}.` : '.'}${salary} Ứng tuyển ngay trên HDP EDU.`,
    path: `/jobs/${jobID}`,
  });
}

export default async function JobDetailPage({ params }: JobPageProps) {
  const { jobID } = await params;
  const session = await getAuthenticatedSession();

  return <JobDetailClient jobId={jobID} userEmail={session?.user.email} />;
}
