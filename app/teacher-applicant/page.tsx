'use client';

import { ClientOnly } from '@/lib/hooks/useClientOnly';
import { TeacherApplicantClient } from '@/components/ecosystem/teacher-center/TeacherApplicantClient';

export default function TeacherApplicantPage() {
  return (
    <ClientOnly>
      <TeacherApplicantClient />
    </ClientOnly>
  );
}
