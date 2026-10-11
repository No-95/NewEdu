import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { LanguageProvider } from '@/lib/context/LanguageContext'
import { AppConvexProvider } from '@/components/convex-provider'
import { SiteModeProvider } from '@/components/site-mode-provider'
import { MessengerDock } from '@/components/MessengerDock'
import { Toaster } from '@/components/ui/toaster'
import { GA4Tracker } from '@/components/GA4Tracker'
import { Suspense } from 'react'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || 'G-E5DZZJLMBX';

export const metadata: Metadata = {
  metadataBase: new URL('https://hdpedu.com'),
  title: {
    default: 'HDP EDU — Tiếng Hàn Sản Xuất cho Người Việt',
    template: '%s | HDP EDU',
    absolute: 'HDP EDU — Tiếng Hàn Sản Xuất cho Người Việt',
  },
  description: 'Học tiếng Hàn sản xuất, công xưởng, nhà máy. Khoá video 72 bài giảng, 15 unit — 399.000₫. Sách "Tiếng Hàn Sản xuất" 225.000₫.',
  alternates: { canonical: 'https://hdpedu.com/' },
  robots: { index: true, follow: true },
  keywords: ['tiếng hàn sản xuất', 'học tiếng hàn nhà máy', 'tiếng hàn công nhân', 'tiếng hàn giao tiếp nhà máy', 'khóa học tiếng hàn sản xuất', 'học tiếng hàn online', 'tiếng hàn cho người đi làm', 'tiếng hàn công ty', 'tiếng hàn cho quản lý', 'tiếng hàn giao tiếp với sếp hàn', 'Korean workplace communication', 'Korean factory vocabulary'],
  authors: [{ name: 'HDP EDU' }],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://hdpedu.com',
    siteName: 'HDP EDU',
    title: 'HDP EDU — Tiếng Hàn Sản Xuất cho Người Việt',
    description: 'Học tiếng Hàn sản xuất, công xưởng, nhà máy. Khoá video 72 bài giảng — 399.000₫. Sách 225.000₫.',
    images: [{ url: '/hdp-logo.png', width: 512, height: 512, alt: 'HDP EDU' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HDP EDU — Tiếng Hàn Sản Xuất',
    description: 'Khoá video tiếng Hàn sản xuất 72 bài — 399.000₫',
    images: ['/hdp-logo.png'],
  },
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

const jsonLdCourse = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'Cẩm nang Video: Tiếng Hàn Sản xuất',
  description: 'Khoá học video tiếng Hàn cho người làm việc trong môi trường sản xuất, công xưởng Hàn Quốc. 72 bài giảng, 15 unit.',
  provider: {
    '@type': 'Organization',
    name: 'HDP EDU',
    sameAs: 'https://hdpedu.com',
  },
  offers: {
    '@type': 'Offer',
    price: '399000',
    priceCurrency: 'VND',
    availability: 'https://schema.org/InStock',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '0',
    reviewCount: '0',
  },
};

const jsonLdBook = {
  '@context': 'https://schema.org',
  '@type': 'Book',
  name: 'Tiếng Hàn Sản xuất',
  author: {
    '@type': 'Organization',
    name: 'HDP EDU',
  },
  offers: {
    '@type': 'Offer',
    price: '225000',
    priceCurrency: 'VND',
    availability: 'https://schema.org/InStock',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark bg-background scroll-smooth" suppressHydrationWarning>
      <head>
        {GA4_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} />
            <script dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA4_ID}', { send_page_view: true });
              `,
            }} />
          </>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCourse) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBook) }}
        />
      </head>
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
        <Suspense fallback={null}>
          <GA4Tracker />
        </Suspense>
      </body>
    </html>
  );
}
