import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Download } from 'lucide-react'
import { caseStudies } from '@/lib/case-studies'
import { site, CV_URL, CV_DOWNLOAD_NAME } from '@/content/site'
import { cv } from '@/content/cv'
import { StudyCard, cardData } from '@/components/StudyCard'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default function HomePage() {
  const featured = caseStudies.filter((cs) => cs.featured)
  const studies = featured.length > 0 ? featured : caseStudies
  const certCount = cv.certificates.length

  return (
    <div className="pb-24">
      <section className="mx-auto max-w-6xl px-5 pt-36 pb-20 sm:px-8">
        <p className="eyebrow mb-4 text-ink-soft">
          {site.role} · {site.location}
        </p>
        <h1
          className="mb-6 font-display font-bold leading-none tracking-tight text-ink"
          style={{ fontSize: 'clamp(2.75rem, 7vw, 4.5rem)' }}
        >
          {site.name}
        </h1>
        <p className="mb-10 max-w-2xl font-body text-xl leading-relaxed text-ink-soft">{site.tagline}</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/case-studies" className="btn-primary">
            View the work
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <a href={CV_URL} download={CV_DOWNLOAD_NAME} className="btn-secondary">
            <Download size={15} aria-hidden="true" />
            Download CV
          </a>
        </div>
      </section>

      <section aria-labelledby="work-heading" className="mx-auto max-w-6xl px-5 sm:px-8">
        <h2 id="work-heading" className="mb-8 font-display text-2xl font-bold text-ink">
          Selected work
        </h2>
        <ul className="m-0 grid list-none grid-cols-[minmax(0,1fr)] gap-6 p-0 md:grid-cols-2">
          {studies.map((study) => (
            <li key={study.slug}>
              <StudyCard study={cardData(study)} />
            </li>
          ))}
        </ul>
      </section>

      {certCount > 0 && (
        <section className="mx-auto mt-20 max-w-6xl px-5 sm:px-8">
          <p className="font-body text-lg text-ink-soft">
            {certCount} professional certification{certCount === 1 ? '' : 's'}, each one verifiable.{' '}
            <Link href="/certifications" className="font-semibold text-ink underline underline-offset-4">
              See them
            </Link>
          </p>
        </section>
      )}
    </div>
  )
}
