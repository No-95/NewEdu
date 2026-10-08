import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Liên hệ HDP EDU",
  description: "Liên hệ HDP EDU về khoá học tiếng Hàn sản xuất, sách, đào tạo doanh nghiệp hoặc hợp tác. Chúng tôi phản hồi trong 24 giờ.",
  alternates: { canonical: 'https://hdpedu.com/contact-us' },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
