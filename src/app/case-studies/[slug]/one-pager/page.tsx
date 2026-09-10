import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Download } from 'lucide-react'
import { getCaseStudy, caseStudies, accentStyle } from '@/lib/case-studies'
import { PrintButton } from '@/components/ui/PrintButton'
import { site, SITE_URL } from '@/content/site'

/**
 * A single forwardable A4 sheet per study, built from the same metadata as
 * the study's summary. `npm run onepagers` prints the public ones to
 * public/one-pagers/. Protected studies get no static file, because a file
 * would sit outside the passphrase: their sheet keeps a print button.
 */

export const dynamicParams = false

export function generateStaticParams() {
  return caseStudies.map((cs) => ({ slug: cs.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const meta = getCaseStudy(slug)
  if (!meta) return {}
  return {
    title: `${meta.title} · One-pager`,
    description: meta.summary,
    robots: { index: false, follow: true },
    alternates: { canonical: `/case-studies/${slug}` },
  }
}

export default async function OnePagerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const meta = getCaseStudy(slug)
  if (!meta) notFound()

  return (
    <div className="px-5 pt-24 pb-16 sm:px-8 print:p-0" style={accentStyle(meta.colour)}>
      <div className="mx-auto mb-8 flex max-w-3xl flex-wrap items-center justify-between gap-4 print:hidden">
        <Link href={`/case-studies/${meta.slug}`} className="group inline-flex items-center gap-2 font-display text-sm font-semibold text-ink">
          <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" aria-hidden="true" />
          Back to the full study
        </Link>
        {meta.protected ? (
          <PrintButton />
        ) : (
          <a href={`/one-pagers/${meta.slug}.pdf`} download={`${meta.slug}-one-pager.pdf`} className="btn-primary print:hidden">
            <Download size={15} aria-hidden="true" />
            Download PDF
          </a>
        )}
      </div>

      <article className="mx-auto max-w-3xl rounded-2xl border border-line bg-paper-raised p-8 shadow-card sm:p-12 print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="mb-8 border-b-4 pb-6" style={{ borderColor: 'var(--accent)' }}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <span className="eyebrow" style={{ color: 'var(--accent-ink)' }}>
              {meta.client} · {meta.tags.join(' · ')}
            </span>
            <span className="eyebrow text-ink-faint">Case study one-pager</span>
          </div>
          <h1 className="mb-3 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">{meta.title}</h1>
          <p className="text-sm text-ink-soft">
            <span className="font-semibold text-ink">{site.name}</span> · {meta.role} · {meta.industry} · {meta.timeline}
          </p>
        </header>

        <section className="mb-8">
          <h2 className="eyebrow mb-2 text-ink-soft">The brief</h2>
          <p className="font-body text-base leading-relaxed text-ink">{meta.summary}</p>
        </section>

        <section className="mb-8 rounded-xl p-6" style={{ background: 'var(--accent-wash)' }}>
          <h2 className="eyebrow mb-2" style={{ color: 'var(--accent-ink)' }}>
            The outcome
          </h2>
          <p className="font-display text-xl font-bold leading-snug" style={{ color: 'var(--accent-ink)' }}>
            {meta.outcome}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="eyebrow mb-3 text-ink-soft">Delivered</h2>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {meta.deliverables.map((item) => (
              <li key={item} className="rounded-full border border-line bg-paper-sunken px-3 py-1.5 text-xs font-medium text-ink">
                {item}
              </li>
            ))}
          </ul>
        </section>

        {meta.endorsement && (
          <figure className="mb-8 border-l-4 pl-5" style={{ borderColor: 'var(--accent)' }}>
            <blockquote>
              <p className="mb-2 font-body italic leading-relaxed text-ink">&ldquo;{meta.endorsement.quote}&rdquo;</p>
            </blockquote>
            <figcaption className="text-sm text-ink-soft">
              <span className="font-semibold text-ink">{meta.endorsement.name}</span>, {meta.endorsement.role}
            </figcaption>
          </figure>
        )}

        <footer className="flex flex-col justify-between gap-2 border-t border-line pt-6 text-sm text-ink-soft sm:flex-row sm:items-center">
          <p className="min-w-0 break-words">
            Full story: <span className="break-all font-medium text-ink">{SITE_URL}/case-studies/{meta.slug}</span>
          </p>
          <p className="min-w-0 break-all font-medium text-ink">{site.email}</p>
        </footer>
      </article>
    </div>
  )
}
