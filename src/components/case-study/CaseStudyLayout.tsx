import Link from 'next/link'
import { ArrowRight, FileText } from 'lucide-react'
import { caseStudies, accentStyle, type CaseStudyMeta } from '@/lib/case-studies'
import { ReadingProgress } from './ReadingProgress'
import { ChapterRail } from './ChapterRail'

const ARTICLE_ID = 'case-study-article'

/**
 * The frame around every case study: a skimmable summary of the facts at
 * the top, then the full MDX narrative with a chapter rail, then the next
 * study. Every fact comes from the study's entry in src/content/studies.ts.
 */
export function CaseStudyLayout({ meta, children }: { meta: CaseStudyMeta; children: React.ReactNode }) {
  const index = caseStudies.findIndex((cs) => cs.slug === meta.slug)
  const next = caseStudies[(index + 1) % caseStudies.length]

  return (
    <div style={accentStyle(meta.colour)}>
      <ReadingProgress />

      <header className="mx-auto max-w-5xl px-5 pt-32 pb-12 sm:px-8">
        <p className="eyebrow mb-4" style={{ color: 'var(--accent-ink)' }}>
          {meta.client} · {meta.tags.join(' · ')}
        </p>
        <h1
          className="mb-6 font-display font-bold leading-tight tracking-tight text-ink"
          style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)' }}
        >
          {meta.title}
        </h1>
        <p className="mb-10 max-w-3xl font-body text-lg leading-relaxed text-ink-soft">{meta.summary}</p>

        <dl className="mb-8 grid grid-cols-[minmax(0,1fr)] gap-6 border-y border-line py-6 sm:grid-cols-3">
          {[
            ['Role', meta.role],
            ['Timeline', meta.timeline],
            ['Industry', meta.industry],
          ].map(([term, value]) => (
            <div key={term}>
              <dt className="eyebrow mb-1 text-ink-faint">{term}</dt>
              <dd className="font-semibold text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mb-8 rounded-2xl p-6 sm:p-8" style={{ background: 'var(--accent-wash)' }}>
          <p className="eyebrow mb-2" style={{ color: 'var(--accent-ink)' }}>
            Outcome
          </p>
          <p className="font-display text-xl font-bold leading-snug sm:text-2xl" style={{ color: 'var(--accent-ink)' }}>
            {meta.outcome}
          </p>
        </div>

        <ul className="mb-8 flex flex-wrap gap-2 list-none m-0 p-0" aria-label="Deliverables">
          {meta.deliverables.map((item) => (
            <li key={item} className="rounded-full border border-line bg-paper-sunken px-3 py-1.5 text-xs font-medium text-ink">
              {item}
            </li>
          ))}
        </ul>

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

        <Link href={`/case-studies/${meta.slug}/one-pager`} className="btn-secondary">
          <FileText size={15} aria-hidden="true" />
          One-page summary
        </Link>
      </header>

      <figure className="mx-auto max-w-5xl px-5 sm:px-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={meta.coverImage}
          alt={meta.coverAlt}
          className="w-full rounded-2xl border border-line"
        />
      </figure>

      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="xl:grid xl:grid-cols-[1fr_220px] xl:gap-12">
          <article id={ARTICLE_ID} className="reading min-w-0">
            {children}
          </article>
          <aside className="xl:sticky xl:top-28 xl:self-start">
            <ChapterRail articleId={ARTICLE_ID} />
          </aside>
        </div>
      </div>

      {next.slug !== meta.slug && (
        <div className="border-t border-line bg-paper-sunken py-16">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <p className="eyebrow mb-3 text-ink-soft">Next case study</p>
            <h2 className="mb-3 font-display text-2xl font-bold text-ink">{next.title}</h2>
            {/* This link can sit at the foot of a public study, so a protected
                next study shows only its title here */}
            {!next.protected && <p className="mb-5 max-w-xl font-body leading-relaxed text-ink-soft">{next.summary}</p>}
            <Link
              href={`/case-studies/${next.slug}`}
              className="group inline-flex items-center gap-2 py-1.5 font-display text-sm font-semibold text-ink"
            >
              Keep reading
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
