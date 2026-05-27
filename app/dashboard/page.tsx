import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth';

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect('/auth');

  return (
    <main className="max-w-7xl mx-auto py-12 px-4">
      <div className="space-y-6">
        <div className="glass p-6 rounded-lg">
          <h1 className="text-2xl font-semibold">Welcome, {user.fullName ?? 'Student'}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="glass p-6 rounded-lg">
            <h2 className="font-semibold">Account</h2>
            <p className="text-sm text-muted-foreground">Profile and subscription details.</p>
          </section>

          <section className="glass p-6 rounded-lg">
            <h2 className="font-semibold">Security</h2>
            <p className="text-sm text-muted-foreground">Change password, manage sessions.</p>
          </section>

          <section className="glass p-6 rounded-lg">
            <h2 className="font-semibold">Notifications</h2>
            <p className="text-sm text-muted-foreground">Email and push preferences.</p>
          </section>

          <section className="glass p-6 rounded-lg">
            <h2 className="font-semibold">Billing</h2>
            <p className="text-sm text-muted-foreground">Payment methods and invoices.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
