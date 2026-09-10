import type { Metadata } from 'next'
import { Download } from 'lucide-react'
import { site, CV_URL, CV_DOWNLOAD_NAME } from '@/content/site'

const description = `About ${site.name}, ${site.role}.`

export const metadata: Metadata = {
  title: 'About',
  description,
  alternates: { canonical: '/about' },
  openGraph: { title: 'About', description, url: '/about', images: ['/og-image.png'] },
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-32 pb-24 sm:px-8">
      <h1
        className="mb-10 font-display font-bold leading-none tracking-tight text-ink"
        style={{ fontSize: 'clamp(2.75rem, 7vw, 4.5rem)' }}
      >
        About
      </h1>

      <div className="mb-12 space-y-5 font-body text-lg leading-relaxed text-ink-soft">
        {site.bio.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {site.testimonials.length > 0 && (
        <section aria-labelledby="testimonials-heading" className="mb-12">
          <h2 id="testimonials-heading" className="mb-6 font-display text-2xl font-bold text-ink">
            What people say
          </h2>
          <ul className="m-0 list-none space-y-6 p-0">
            {site.testimonials.map((t) => (
              <li key={t.name}>
                <figure className="rounded-2xl border border-line bg-paper-raised p-6">
                  <blockquote>
                    <p className="mb-3 font-body italic leading-relaxed text-ink">&ldquo;{t.quote}&rdquo;</p>
                  </blockquote>
                  <figcaption className="text-sm text-ink-soft">
                    <span className="font-semibold text-ink">{t.name}</span>, {t.role}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <a href={`mailto:${site.email}`} className="btn-primary">
          Get in touch
        </a>
        <a href={CV_URL} download={CV_DOWNLOAD_NAME} className="btn-secondary">
          <Download size={15} aria-hidden="true" />
          Download CV
        </a>
      </div>
    </div>
  )
}
