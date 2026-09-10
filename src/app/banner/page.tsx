import type { Metadata } from 'next'
import { caseStudies } from '@/lib/case-studies'
import { site } from '@/content/site'

export const metadata: Metadata = {
  title: 'LinkedIn banner',
  robots: { index: false, follow: false },
}

/**
 * The LinkedIn profile banner (1584x396). `npm run banner` photographs this
 * route. LinkedIn overlays the round profile photo on the lower left, so
 * that zone stays empty.
 */
export default function BannerPage() {
  return (
    <div className="fixed inset-0 z-[300] h-[396px] w-[1584px] overflow-hidden bg-paper">
      <div className="absolute right-[72px] top-[110px] w-[820px] text-right">
        <p className="eyebrow mb-5 text-[15px] text-ink-soft">{site.role}</p>
        <p className="font-display text-[40px] font-bold leading-[1.15] text-ink">{site.tagline}</p>
        <div className="mt-8 flex items-center justify-end gap-4">
          <span className="flex items-center gap-2.5" aria-hidden="true">
            {caseStudies.map((cs) => (
              <span key={cs.slug} className="h-3.5 w-3.5 rounded-full" style={{ background: cs.colour.accent }} />
            ))}
          </span>
          <span className="font-mono text-[17px] font-semibold text-ink">{site.url.replace(/^https?:\/\//, '')}</span>
        </div>
      </div>
    </div>
  )
}
