'use client';

import { ClientOnly } from '@/lib/hooks/useClientOnly';
import { ExpertApplicantClient } from '@/components/ecosystem/experts/ExpertApplicantClient';

export default function ExpertApplicantPage() {
  return (
    <ClientOnly>
      <ExpertApplicantClient />
    </ClientOnly>
  );
}
