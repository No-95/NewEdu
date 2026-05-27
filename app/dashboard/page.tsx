import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/ParticleBackground';
import ProfileSettingsClient from '@/components/dashboard/ProfileSettingsClient';
import DepositClient from '@/components/dashboard/DepositClient';

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect('/auth');

  return (
    <>
      <Header />
      <ParticleBackground />

      <main className="relative z-10 max-w-7xl mx-auto py-24 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            <div className="glass p-6 rounded-lg">
              <ProfileSettingsClient />
            </div>

            <div className="glass p-6 rounded-lg">
              <h4 className="font-semibold">Subscription</h4>
              <p className="text-sm text-muted-foreground">Free • Upgrade for more features</p>
              <div className="mt-4">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">Manage plan</button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <section className="lg:col-span-3">
            <div className="glass p-6 rounded-lg mb-6">
              <h1 className="text-2xl font-semibold">Welcome back, {user.fullName ?? 'Student'}</h1>
              <p className="text-sm text-muted-foreground">Here’s a quick summary of your account and recent activity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div id="account" className="glass p-6 rounded-lg">
                <h2 className="font-semibold">Account</h2>
                <p className="text-sm text-muted-foreground">Profile and subscription details.</p>
              </div>

              <div id="security" className="glass p-6 rounded-lg">
                <h2 className="font-semibold">Security</h2>
                <p className="text-sm text-muted-foreground">Change password, manage sessions.</p>
              </div>

              <div id="notifications" className="glass p-6 rounded-lg">
                <h2 className="font-semibold">Notifications</h2>
                <p className="text-sm text-muted-foreground">Email and push preferences.</p>
              </div>

              <div id="billing" className="glass p-6 rounded-lg">
                <h2 className="font-semibold">Billing</h2>
                <p className="text-sm text-muted-foreground">Payment methods and invoices.</p>
                <div className="mt-4">
                  <DepositClient />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
