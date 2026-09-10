'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { getCaseStudy, accentStyle } from '@/lib/case-studies'
import { UnlockForm } from '@/components/unlock/UnlockForm'

export default function StudyUnlockPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
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
