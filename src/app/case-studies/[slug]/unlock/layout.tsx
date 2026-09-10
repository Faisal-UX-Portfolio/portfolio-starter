import type { Metadata } from 'next'
import { getCaseStudy } from '@/lib/case-studies'

/**
 * The unlock page itself is a client component, which cannot declare
 * metadata, so its title and search-engine instructions live here. Noindex
 * in every case, including the 404 a public study's unlock address gives.
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const meta = getCaseStudy(slug)
  return {
    title: meta?.protected ? `${meta.title} (protected)` : 'Not found',
    robots: { index: false, follow: false },
  }
}

export default function StudyUnlockLayout({ children }: { children: React.ReactNode }) {
  return children
}
