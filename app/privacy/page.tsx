'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
import { ClientOnly } from '@/lib/hooks/useClientOnly';

function PrivacyContent() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ParticleBackground />
      <Header />
      <main className="relative z-10 mx-auto max-w-3xl px-6 pb-16 pt-28">
        <h1 className="mb-4 text-4xl font-bold">Privacy Policy</h1>
        <p className="mb-8 text-muted-foreground">
          Last updated: June 10, 2026 · HDP EDU / HDP Holdings
        </p>
        <div className="home-card space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            HDP EDU collects information you provide when creating an account, purchasing courses,
            submitting forms, or contacting support — including name, email, phone, and usage data
            needed to deliver our services.
          </p>
          <p>
            We use this information to authenticate users, process orders, improve learning experiences,
            and respond to support requests. We do not sell personal data to third parties.
          </p>
          <p>
            Payment processing may involve trusted providers (e.g. PayOS, MoMo, VNPay) under their own
            privacy terms. You may request account-related assistance via{' '}
            <Link href="/contact-us?topic=privacy" className="text-primary hover:underline">
              our contact page
            </Link>
            .
          </p>
        </div>
        <Link href="/auth" className="mt-8 inline-block text-primary hover:underline">
          ← Back to sign in
        </Link>
      </main>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <ClientOnly>
      <PrivacyContent />
    </ClientOnly>
  );
}
