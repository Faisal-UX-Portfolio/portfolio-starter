import type { Metadata } from 'next'
import { caseStudies } from '@/lib/case-studies'
import { site } from '@/content/site'

export const metadata: Metadata = {
  title: 'OG card',
  robots: { index: false, follow: false },
}

/**
 * The social sharing card, composed as a live page so it uses the site's
 * real fonts and tokens. `npm run og` photographs this route at exactly
 * 1200x630 and writes public/og-image.png. Rerun it after any visual change.
 */
export default function OgPage() {
  return (
    <div className="fixed inset-0 z-[300] h-[630px] w-[1200px] overflow-hidden bg-paper">
      <div className="absolute left-[80px] top-[150px] w-[1040px]">
        <p className="eyebrow mb-8 text-base text-ink-soft">{site.role}</p>
        <h1 className="mb-10 font-display text-[96px] font-bold leading-none tracking-tight text-ink">{site.name}</h1>
        <p className="max-w-[820px] font-body text-2xl leading-relaxed text-ink-soft">{site.tagline}</p>
        <div className="mt-12 flex items-center gap-3" aria-hidden="true">
          {caseStudies.map((cs) => (
            <span key={cs.slug} className="h-4 w-4 rounded-full" style={{ background: cs.colour.accent }} />
          ))}
        </div>
      </div>
    </div>
  )
}
