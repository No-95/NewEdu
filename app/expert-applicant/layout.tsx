import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Đăng ký làm chuyên gia",
  description: "Gửi đơn đăng ký trở thành chuyên gia của HDP EDU: chia sẻ chuyên môn về tiếng Hàn sản xuất, tuyển dụng và đào tạo.",
  alternates: { canonical: 'https://hdpedu.com/expert-applicant' },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
