'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { ParticleBackground } from '@/components/DarkmodeParticleBackground';
import { ClientOnly } from '@/lib/hooks/useClientOnly';

function TermsContent() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ParticleBackground />
      <Header />
      <main className="relative z-10 mx-auto max-w-3xl px-6 pb-16 pt-28">
        <h1 className="mb-4 text-4xl font-bold">Terms of Service</h1>
        <p className="mb-8 text-muted-foreground">
          Last updated: June 10, 2026 · HDP EDU / HDP Holdings
        </p>
        <div className="home-card space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            By using HDP EDU (hdpedu.com), you agree to use the platform responsibly for learning,
            career development, and community participation. Course purchases, account data, and
            communications are handled according to our privacy practices.
          </p>
          <p>
            Content on the platform is provided for educational and professional development purposes.
            HDP Holdings and HDP EDU may update features, pricing, and policies with reasonable notice
            where required.
          </p>
          <p>
            For account, billing, or partnership questions, contact us at{' '}
            <Link href="/contact-us" className="text-primary hover:underline">
              hdpedu.com/contact-us
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

export default function TermsPage() {
  return (
    <ClientOnly>
      <TermsContent />
    </ClientOnly>
  );
}
