import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { LanguageProvider } from '@/lib/context/LanguageContext'
import { AppConvexProvider } from '@/components/convex-provider'
import { SiteModeProvider } from '@/components/site-mode-provider'
import { MessengerDock } from '@/components/MessengerDock'
import { Toaster } from '@/components/ui/toaster'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'HDP EDU - Learn Korean Anywhere',
  description: 'Master Korean language with AI-powered learning. Interactive lessons, immersive experience, and community support.',
  generator: 'v0.app',
  keywords: ['Korean learning', 'language education', 'AI tutor', 'HDP EDU'],
  authors: [{ name: 'HDP EDU' }],
  icons: {
    icon: '/hdp-logo.png',
    shortcut: '/hdp-logo.png',
    apple: '/hdp-logo.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0e27',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background scroll-smooth" suppressHydrationWarning>
      <body className="font-sans antialiased overflow-x-hidden" suppressHydrationWarning>
        <SiteModeProvider>
          <AppConvexProvider>
            <LanguageProvider>
              {children}
              <MessengerDock />
              <Toaster />
            </LanguageProvider>
          </AppConvexProvider>
        </SiteModeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
