import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = { title: 'Page not found' }

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-5 pt-16">
      <div className="max-w-md pb-16 text-center">
        <p className="eyebrow mb-3 text-ink-soft">Error 404</p>
        <h1 className="mb-4 font-display text-4xl font-bold text-ink">Page not found</h1>
        <p className="mb-9 font-body leading-relaxed text-ink-soft">
          Whatever was here has moved, or never existed.
        </p>
        <Link href="/" className="btn-primary">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to the home page
        </Link>
      </div>
    </div>
  )
}
