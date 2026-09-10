import type { Metadata } from 'next'
import { ArrowUpRight } from 'lucide-react'
import { certMonth, cv } from '@/content/cv'
import { site, CV_URL, CV_DOWNLOAD_NAME } from '@/content/site'
import { CertificateDialog } from '@/components/ui/CertificateDialog'

const description = `Professional certifications held by ${site.name}, each one verifiable.`

export const metadata: Metadata = {
  title: 'Certifications',
  description,
  alternates: { canonical: '/certifications' },
  openGraph: { title: 'Certifications', description, url: '/certifications', images: ['/og-image.png'] },
}

export default function CertificationsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-32 pb-24 sm:px-8">
      <h1
        className="mb-6 font-display font-bold leading-none tracking-tight text-ink"
        style={{ fontSize: 'clamp(2.75rem, 7vw, 4.5rem)' }}
      >
        Certifications
      </h1>
      <p className="mb-14 max-w-2xl font-body text-lg leading-relaxed text-ink-soft">
        Each one links back to the issuer&rsquo;s record and says whether it runs indefinitely or has a renewal date.
      </p>

      <ol className="m-0 grid list-none grid-cols-[minmax(0,1fr)] items-start gap-6 p-0 lg:grid-cols-2">
        {cv.certificates.map((cert) => (
          <li key={cert.credentialId}>
            <article className="rounded-2xl border border-line bg-paper-raised p-7 sm:p-9">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <h2 className="min-w-0 font-display text-xl font-bold leading-tight text-ink sm:text-2xl">{cert.title}</h2>
                <span className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft">
                  {cert.expires ? `Valid to ${certMonth(cert.expires)}` : 'No expiry'}
                </span>
              </div>
              <p className="mb-1 text-sm font-semibold text-ink-soft">{cert.institution}</p>
              <p className="mb-1 font-mono text-xs text-ink-soft">Issued {certMonth(cert.issued)}</p>
              <p className="eyebrow mb-5 text-ink-faint">Credential ID {cert.credentialId}</p>

              {cert.preview && cert.url ? (
                <CertificateDialog
                  title={cert.title}
                  src={cert.preview}
                  href={cert.url}
                  isFile={!cert.url.startsWith('http')}
                  caption={`${cert.institution} · Credential ID ${cert.credentialId}`}
                />
              ) : cert.url ? (
                <a
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 py-1.5 font-display text-sm font-semibold text-ink"
                >
                  Verify credential
                  <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </a>
              ) : null}
            </article>
          </li>
        ))}
      </ol>

      <div className="mt-14 border-t border-line pt-6">
        <a href={CV_URL} download={CV_DOWNLOAD_NAME} className="group inline-flex items-center gap-2 py-1.5 font-display text-sm font-semibold text-ink">
          Download full CV
          <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  )
}
