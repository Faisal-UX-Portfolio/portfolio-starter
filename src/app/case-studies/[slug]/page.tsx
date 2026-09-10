import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CaseStudyLayout } from '@/components/case-study/CaseStudyLayout'
import { caseStudies, getCaseStudy } from '@/lib/case-studies'
import { site, SITE_URL } from '@/content/site'
import { jsonLd } from '@/lib/json-ld'

// Every study is built at deploy time; any other slug is a 404
export const dynamicParams = false

export function generateStaticParams() {
  return caseStudies.map((cs) => ({ slug: cs.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const meta = getCaseStudy(slug)
  if (!meta) return {}
  const path = `/case-studies/${slug}`
  return {
    title: meta.title,
    description: meta.summary,
    alternates: { canonical: path },
    robots: meta.protected ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      url: path,
      title: `${meta.title} · ${meta.client}`,
      description: meta.summary,
      images: ['/og-image.png'],
    },
  }
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const meta = getCaseStudy(slug)
  if (!meta) notFound()

  // The MDX file is found by slug, so a new study needs no import added
  // here. The relative path lets the bundler see every file in the folder.
  const { default: Content } = await import(`../../../content/case-studies/${slug}.mdx`)

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title,
    description: `${meta.summary} Outcome: ${meta.outcome}.`,
    about: meta.industry,
    keywords: meta.tags.join(', '),
    author: { '@type': 'Person', name: site.name, jobTitle: meta.role, url: SITE_URL },
  }

  return (
    <CaseStudyLayout meta={meta}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(article) }} />
      <Content />
    </CaseStudyLayout>
  )
}
