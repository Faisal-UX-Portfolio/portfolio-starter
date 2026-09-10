import type { Metadata } from 'next'
import Script from 'next/script'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'
import { Nav } from '@/components/ui/Nav'
import { Footer } from '@/components/ui/Footer'
import { CookieConsent } from '@/components/ui/CookieConsent'
import { site, SITE_URL } from '@/content/site'
import { cv } from '@/content/cv'
import { LOCKDOWN } from '@/lib/lockdown'
import { jsonLd } from '@/lib/json-ld'

const title = `${site.name}, ${site.role}`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: `%s | ${site.name}` },
  description: site.tagline,
  openGraph: {
    type: 'website',
    locale: site.locale.replace('-', '_'),
    url: SITE_URL,
    siteName: site.name,
    title,
    description: site.tagline,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description: site.tagline,
    images: ['/og-image.png'],
  },
  robots: { index: !LOCKDOWN, follow: !LOCKDOWN },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
}

// Structured data so search engines and AI reviewers can read the facts
// without parsing the layout. Derived from site.ts and cv.ts, never typed twice.
const person = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: site.name,
  jobTitle: site.role,
  description: site.tagline,
  url: SITE_URL,
  sameAs: [site.linkedin],
  hasCredential: cv.certificates.map((cert) => ({
    '@type': 'EducationalOccupationalCredential',
    name: cert.title,
    credentialCategory: 'certificate',
    recognizedBy: { '@type': 'Organization', name: cert.institution },
    ...(cert.url ? { url: cert.url.startsWith('http') ? cert.url : `${SITE_URL}${cert.url}` } : {}),
  })),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.locale} suppressHydrationWarning>
      <head>
        {/* Applies a pinned light or dark choice before the first paint, so
            the page never flashes the device appearance first. Inline and
            synchronous on purpose; a blocked localStorage falls through. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.dataset.theme=t}}catch(e){}`,
          }}
        />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(person) }} />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Nav />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            {/* Consent Mode: analytics storage is denied until the visitor
                accepts, set before Analytics loads so no cookie comes first */}
            <Script id="consent-default" strategy="beforeInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{analytics_storage:'denied'});`}
            </Script>
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
            <CookieConsent />
          </>
        )}
      </body>
    </html>
  )
}
