'use client'

import { useRef } from 'react'
import { ArrowUpRight, Download, Maximize2, X } from 'lucide-react'

interface CertificateDialogProps {
  /** The certification's title, used as the image's alt text and the dialog label */
  title: string
  /** Preview raster of the certificate */
  src: string
  /** The issuer's verification page, or the certificate PDF */
  href: string
  /** True when href is the PDF itself rather than a verification page */
  isFile: boolean
  /** Issuer and credential ID, shown under the image */
  caption: string
}

/**
 * Opens a certificate over the page rather than in a new tab, where the PDF
 * arrives at its own scale and phones hand it to a separate viewer.
 *
 * Built on the native <dialog>: showModal() gives the top layer, the focus
 * trap, Esc to close and an inert page for free, so none of that is
 * reimplemented here. The image is a WebP, captured from the issuer's record
 * or rendered from the PDF, because an embedded PDF is unreliable on iOS
 * Safari; the authoritative source stays one click away inside the dialog.
 */
export function CertificateDialog({ title, src, href, isFile, caption }: CertificateDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="group block w-full text-left"
        aria-label={`View the ${title} certificate`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          loading="lazy"
          className="w-full rounded-lg border border-line transition-transform group-hover:scale-[1.01]"
        />
        <span className="mt-3 inline-flex items-center gap-1.5 py-1.5 text-sm font-display font-semibold text-inherit">
          View certificate
          <Maximize2 size={13} aria-hidden="true" />
        </span>
      </button>

      {/* Clicking the backdrop resolves to the dialog element itself, which
          is how a click outside the panel is told from one inside it */}
      <dialog
        ref={ref}
        aria-label={title}
        onClick={(event) => {
          if (event.target === ref.current) ref.current?.close()
        }}
        className="m-auto w-[92vw] max-w-4xl bg-transparent p-0 text-ink backdrop:bg-ink/70 backdrop:backdrop-blur-sm"
      >
        <div className="rounded-2xl border border-line bg-paper-raised p-4 sm:p-6 shadow-card">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 className="min-w-0 font-display font-bold text-lg sm:text-xl text-ink">{title}</h2>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="shrink-0 rounded-full border border-line p-2 text-ink-soft hover:text-ink hover:border-ink transition-colors"
              aria-label="Close"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={title} className="w-full rounded-lg border border-line" />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-2xs font-semibold uppercase tracking-widest text-ink-faint">{caption}</p>
            <a
              href={href}
              {...(isFile ? { download: true } : { target: '_blank', rel: 'noopener noreferrer' })}
              className="inline-flex items-center gap-2 py-1.5 text-sm font-display font-semibold text-ink hover:text-ink-soft transition-colors"
            >
              {isFile ? <Download size={14} aria-hidden="true" /> : <ArrowUpRight size={14} aria-hidden="true" />}
              {isFile ? 'Download PDF' : 'Verify with the issuer'}
            </a>
          </div>
        </div>
      </dialog>
    </>
  )
}
