import Link from 'next/link'
import { Lock } from 'lucide-react'
import { accentStyle, type CaseStudyMeta } from '@/lib/case-studies'

/**
 * A case study in a grid. A protected study shows a lock panel instead of
 * its cover: the cover lives behind the passphrase with the rest of the
 * study, so it would not load for a visitor who has not unlocked it.
 */
type CardData = Pick<CaseStudyMeta, 'slug' | 'title' | 'client' | 'colour' | 'protected'> &
  Partial<Pick<CaseStudyMeta, 'summary' | 'coverImage'>>

/**
 * Only what the card shows. React's development build copies a component's
 * props into the page source, so passing the whole study would publish a
 * protected study's outcome and quote there, even though nothing renders it.
 */
export function cardData(s: CaseStudyMeta): CardData {
  const { slug, title, client, colour } = s
  return s.protected
    ? { slug, title, client, colour, protected: true }
    : { slug, title, client, colour, protected: s.protected, summary: s.summary, coverImage: s.coverImage }
}

export function StudyCard({ study }: { study: CardData }) {
  return (
    <Link
      href={`/case-studies/${study.slug}`}
      style={accentStyle(study.colour)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-paper-raised transition-shadow hover:shadow-card"
    >
      <div className="aspect-[16/10] overflow-hidden" style={{ background: 'var(--accent-wash)' }}>
        {study.protected ? (
          <div className="flex h-full flex-col items-center justify-center gap-2" style={{ color: 'var(--accent-ink)' }}>
            <Lock size={28} aria-hidden="true" />
            <span className="eyebrow">Passphrase protected</span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={study.coverImage}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <p className="eyebrow mb-2" style={{ color: 'var(--accent-ink)' }}>
          {study.client}
        </p>
        <h3 className="mb-3 font-display text-xl font-bold leading-snug text-ink">{study.title}</h3>
        {/* A protected study shows only its client and title in public */}
        {!study.protected && <p className="font-body leading-relaxed text-ink-soft">{study.summary}</p>}
      </div>
    </Link>
  )
}
