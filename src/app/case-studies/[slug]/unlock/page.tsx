import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCaseStudy, accentStyle } from '@/lib/case-studies'
import { UnlockForm } from '@/components/unlock/UnlockForm'

/**
 * A server component on purpose, and it must stay one. As a client
 * component it pulled every study's details, protected ones included, into
 * a public JavaScript file under /_next/static, which the passphrase cannot
 * cover. Only the strings passed to UnlockForm below reach the browser now.
 * `npm run check:security` refuses a client component that imports study
 * data, and scans the production build for protected text.
 */

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const meta = getCaseStudy(slug)
  return {
    title: meta?.protected ? `${meta.title} (protected)` : 'Not found',
    robots: { index: false, follow: false },
  }
}

export default async function StudyUnlockPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const meta = getCaseStudy(slug)
  if (!meta || !meta.protected) notFound()

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-16" style={accentStyle(meta.colour)}>
      <div className="w-full max-w-lg pb-16">
        <UnlockForm
          slug={slug}
          title={`${meta.client}: ${meta.title}`}
          blurb="This case study is confidential. Enter the four-word passphrase to read it."
          redirectTo={`/case-studies/${slug}`}
        />
      </div>
    </div>
  )
}
