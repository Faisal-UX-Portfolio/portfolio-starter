import type { CSSProperties } from 'react'
import { caseStudies } from '@/content/studies'

/**
 * The case study engine: types and helpers. The studies themselves live in
 * src/content/studies.ts and src/content/case-studies/<slug>.mdx.
 */

export { caseStudies }

export interface StudyColour {
  /** Vibrant form: surfaces and decoration. The same in both appearances */
  accent: string
  /** Darkened form: must pass WCAG AA (4.5:1) as text on the light canvas */
  ink: string
  /** Lightened form: must pass WCAG AA as text on the dark canvas */
  glow: string
  /** Pale tint: backgrounds behind text set in `ink` */
  wash: string
  /** The dark-appearance tint, usually the accent at low opacity */
  washDark: string
}

export interface CaseStudyMeta {
  /** Also the MDX filename and the URL: /case-studies/<slug> */
  slug: string
  title: string
  client: string
  tags: string[]
  summary: string
  /** Path under public/, normally /case-studies/<slug>/cover.<ext> */
  coverImage: string
  /** Alt text for the cover image. Describe what it shows. */
  coverAlt: string
  colour: StudyColour
  role: string
  timeline: string
  industry: string
  deliverables: string[]
  outcome: string
  /** A verbatim quote about this piece of work. Never paraphrase it. */
  endorsement?: { quote: string; name: string; role: string }
  /** Behind the passphrase: the page, its one-pager and its images */
  protected?: boolean
  /** Shown on the home page */
  featured?: boolean
  /** Template demo content. `npm run check -- --strict` fails while any remain. */
  demo?: boolean
}

export function getCaseStudy(slug: string): CaseStudyMeta | undefined {
  return caseStudies.find((cs) => cs.slug === slug)
}

/** Slugs that need the access cookie. Middleware and the unlock flow both read this. */
export const protectedSlugs = caseStudies.filter((cs) => cs.protected).map((cs) => cs.slug)

/**
 * CSS custom properties that theme a subtree in a study's colour.
 *
 * The text-bearing forms are wrapped in `light-dark()` so one inline style
 * carries both appearances. An inline value would otherwise beat any
 * dark-appearance rule in globals.css, and the visitor's choice is not known
 * when the page is rendered on the server.
 */
export function accentStyle(colour: StudyColour): CSSProperties {
  return {
    '--accent': colour.accent,
    '--accent-ink': `light-dark(${colour.ink}, ${colour.glow})`,
    '--accent-wash': `light-dark(${colour.wash}, ${colour.washDark})`,
  } as CSSProperties
}
