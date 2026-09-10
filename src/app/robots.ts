import type { MetadataRoute } from 'next'
import { allProtectedSlugs, pathForSlug } from '@/lib/protected-routes'
import { SITE_URL } from '@/content/site'
import { LOCKDOWN } from '@/lib/lockdown'

/**
 * Generated so the disallow list derives from the same registry that drives
 * the middleware: protecting a study removes it from crawling automatically.
 */
export default function robots(): MetadataRoute.Robots {
  if (LOCKDOWN) {
    return { rules: { userAgent: '*', disallow: '/' }, sitemap: `${SITE_URL}/sitemap.xml` }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/cv',
        '/documents/',
        '/og',
        '/banner',
        '/one-pagers/',
        ...allProtectedSlugs.flatMap((slug) => pathForSlug(slug) ?? []),
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
