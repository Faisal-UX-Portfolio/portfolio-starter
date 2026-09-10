import { caseStudies, protectedSlugs } from './case-studies'
import { LOCKDOWN, LOCKDOWN_SLUG } from './lockdown'

/**
 * Every slug the unlock API will accept. The lockdown slug is listed only
 * while the site is locked; it has no path, so the matching in
 * middleware.ts skips straight past it.
 */
export const allProtectedSlugs: string[] = [
  ...protectedSlugs,
  ...(LOCKDOWN ? [LOCKDOWN_SLUG] : []),
]

/** The base route a protected slug lives under. */
export function pathForSlug(slug: string): string | undefined {
  if (caseStudies.some((cs) => cs.slug === slug)) return `/case-studies/${slug}`
  return undefined
}
