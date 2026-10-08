import { OnboardingSurveyClient } from '@/components/onboarding/OnboardingSurveyClient';
import type { Metadata } from 'next';

export default function OnboardingPage() {
  return <OnboardingSurveyClient />;
}

export const metadata: Metadata = {
  title: "Khảo sát đầu vào",
  description: "Khảo sát ngắn giúp HDP EDU hiểu mục tiêu học tiếng Hàn của bạn và gợi ý lộ trình phù hợp nhất.",
  alternates: { canonical: 'https://hdpedu.com/onboarding' },
  robots: { index: false, follow: false },
}
