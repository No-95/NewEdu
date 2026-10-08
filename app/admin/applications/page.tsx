import { AdminApplicationsClient } from '@/components/admin/AdminApplicationsClient';
import { requireAdminRole } from '@/lib/ecosystem/require-admin-role';
import type { Metadata } from 'next';

export default async function AdminApplicationsPage() {
  const session = await requireAdminRole();
  return <AdminApplicationsClient userEmail={session.user.email} />;
}

export const metadata: Metadata = {
  title: "Duyệt đơn ứng tuyển",
  description: "Khu vực quản trị HDP EDU: duyệt đơn ứng tuyển giáo viên và chuyên gia. Trang nội bộ, không hiển thị với công cụ tìm kiếm.",
  alternates: { canonical: 'https://hdpedu.com/admin/applications' },
  robots: { index: false, follow: false },
}
