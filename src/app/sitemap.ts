import type { MetadataRoute } from 'next'
import { caseStudies } from '@/lib/case-studies'
import { SITE_URL } from '@/content/site'
import { LOCKDOWN } from '@/lib/lockdown'

export default function sitemap(): MetadataRoute.Sitemap {
  // Nothing is reachable while the site is locked, so advertise nothing
  if (LOCKDOWN) return []

  const lastModified = new Date()
  const page = (path: string, priority: number) => ({ url: `${SITE_URL}${path}`, lastModified, priority })

  return [
    page('', 1),
    page('/case-studies', 0.9),
    page('/about', 0.7),
    page('/certifications', 0.6),
    ...caseStudies.filter((cs) => !cs.protected).map((cs) => page(`/case-studies/${cs.slug}`, 0.8)),
  ]
}
