import type { Metadata } from 'next'
import { caseStudies } from '@/lib/case-studies'
import { site } from '@/content/site'
import { StudyCard } from '@/components/StudyCard'

const description = `Case studies by ${site.name}, ${site.role}.`

export const metadata: Metadata = {
  title: 'Work',
  description,
  alternates: { canonical: '/case-studies' },
  openGraph: { title: 'Work', description, url: '/case-studies', images: ['/og-image.png'] },
}

export default function CaseStudiesPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-32 pb-24 sm:px-8">
      <h1
        className="mb-12 font-display font-bold leading-none tracking-tight text-ink"
        style={{ fontSize: 'clamp(2.75rem, 7vw, 4.5rem)' }}
      >
        Work
      </h1>
      <ul className="m-0 grid list-none grid-cols-[minmax(0,1fr)] gap-6 p-0 md:grid-cols-2">
        {caseStudies.map((study) => (
          <li key={study.slug}>
            <StudyCard study={study} />
          </li>
        ))}
      </ul>
    </div>
  )
}
