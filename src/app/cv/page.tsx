import type { Metadata } from 'next'
import { Mail, MapPin, Phone, Send } from 'lucide-react'
import { certCvDates, cv } from '@/content/cv'
import { site } from '@/content/site'

/**
 * The CV as an A4 document. Not linked from anywhere and noindexed: it exists
 * to be printed to PDF by `npm run cv` (scripts/generate-cv.mjs), which writes
 * public/documents/cv.pdf, the file every "Download CV" link points at.
 *
 * Built to survive CV parsers (applicant tracking systems): real text, real
 * bullet characters, one column of reading order, sizes in points.
 */

export const metadata: Metadata = {
  title: 'CV',
  robots: { index: false, follow: false },
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-[16.5pt] mb-[8pt] border-b-[1.32pt] border-dotted border-cv-rule pb-[6pt] text-[10.58pt] font-medium uppercase tracking-[0.5pt] text-cv-ink">
      {children}
    </h2>
  )
}

/**
 * The marker is a real character rather than a CSS list-disc: Chrome's
 * print-to-PDF leaves CSS markers out of the text layer, so parsers would
 * lose the list structure.
 */
function Bullets({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((text) => (
        <li key={text} className="mb-[3pt] flex break-inside-avoid">
          <span aria-hidden="true" className="w-[10.58pt] shrink-0">
            &bull;
          </span>
          <span>{text}</span>
        </li>
      ))}
    </ul>
  )
}

export default function CvPage() {
  // CV_PHONE lives in .env.local so the number stays out of the repo, and the
  // NODE_ENV check stops it being prerendered into a production build. The
  // PDF is printed from the dev server, so it still gets the number.
  const phone = process.env.NODE_ENV === 'production' ? undefined : process.env.CV_PHONE
  const portfolio = site.url.replace(/^https?:\/\//, '')

  return (
    <div className="bg-white pt-24 pb-16 print:p-0">
      <style>{`@media print { body { background: white; } }`}</style>
      {/* A4 width on screen too, but allowed to shrink on a phone. Print
          ignores both: the generator supplies the page and its margins. */}
      <article
        className="mx-auto w-full max-w-[182mm] bg-white px-5 font-cv text-[9.26pt] leading-[11.9pt] text-cv-ink print:max-w-none print:px-0"
        lang={site.locale}
      >
        <header className="flex flex-wrap items-start justify-between gap-[20pt]">
          <div>
            <h1 className="text-[18pt] font-bold leading-[22pt] text-cv-ink">{site.name}</h1>
            <p className="mt-[4pt] text-[11pt] leading-[14pt] text-cv-ink">{site.role}</p>
          </div>
          <address className="space-y-[4.6pt] text-[9.26pt] not-italic leading-[11.3pt]">
            {phone ? (
              <div className="flex items-center gap-[5pt]">
                <Phone size={10.6} aria-label="Phone" className="shrink-0" />
                <span>{phone}</span>
              </div>
            ) : null}
            <div className="flex items-center gap-[5pt]">
              <Mail size={10.6} aria-label="Email" className="shrink-0" />
              <a href={`mailto:${site.email}`} className="text-cv-ink no-underline">
                {site.email}
              </a>
            </div>
            <div className="flex items-center gap-[5pt]">
              <Send size={10.6} aria-label="Portfolio" className="shrink-0" />
              <a href={site.url} className="text-cv-ink no-underline">
                {portfolio}
              </a>
            </div>
            <div className="flex items-center gap-[5pt]">
              <MapPin size={10.6} aria-label="Location" className="shrink-0" />
              <span>{site.location}</span>
            </div>
          </address>
        </header>

        <SectionHeading>Summary</SectionHeading>
        <p>{cv.summary}</p>

        <SectionHeading>Experience</SectionHeading>
        {cv.roles.map((role) => (
          <section key={`${role.employer}-${role.dates}`} className="mb-[12pt]">
            <div className="flex break-inside-avoid items-baseline justify-between gap-[10pt]">
              <h3 className="font-medium text-cv-ink">{role.title}</h3>
              <p className="shrink-0 text-cv-muted">{role.dates}</p>
            </div>
            <p className="mb-[5pt] text-cv-muted">{role.employer}</p>
            {role.intro ? <p className="mb-[6pt]">{role.intro}</p> : null}
            <Bullets items={role.bullets} />
          </section>
        ))}

        {cv.certificates.length > 0 && (
          <>
            <SectionHeading>Education &amp; Certifications</SectionHeading>
            {cv.certificates.map((cert) => (
              <div key={cert.title} className="mb-[5pt] flex break-inside-avoid items-baseline justify-between gap-[10pt]">
                <h3 className="font-medium text-cv-ink">
                  {/* Only absolute URLs: a relative one would resolve against localhost in the PDF */}
                  {cert.url?.startsWith('http') ? (
                    <a href={cert.url} className="text-cv-ink no-underline">
                      {cert.title}
                    </a>
                  ) : (
                    cert.title
                  )}
                  <span className="font-normal text-cv-muted"> | {cert.institution}</span>
                </h3>
                <p className="shrink-0 text-cv-muted">{certCvDates(cert)}</p>
              </div>
            ))}
          </>
        )}

        <SectionHeading>Skills</SectionHeading>
        <ul className="gap-[7.9pt] sm:columns-2 print:columns-2">
          {cv.skills.map((skill) => (
            <li key={skill.name} className="grid break-inside-avoid grid-cols-[minmax(0,129pt)_1fr] gap-[4pt] leading-[13.5pt]">
              <span>{skill.name}</span>
              <span className="text-cv-muted">{skill.level}</span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  )
}
