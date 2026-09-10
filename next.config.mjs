import createMDX from '@next/mdx'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
import remarkGfm from 'remark-gfm'
import remarkUnwrapImages from 'remark-unwrap-images'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm, remarkUnwrapImages],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
    ],
  },
})

// Google's hosts are allowed only when analytics is switched on, so a site
// without a GA ID ships the tightest policy. The wildcards follow Google's
// own CSP guidance for gtag.js: GA4 sends hits to regional endpoints, and a
// single-host allowance silently blocks all analytics.
const analytics = Boolean(process.env.NEXT_PUBLIC_GA_ID)
const google = (hosts) => (analytics ? ` ${hosts}` : '')

// 'unsafe-inline' is required by Next's bootstrap script, the JSON-LD blocks
// and inline style attributes. The site has no user-generated content, which
// is the risk unsafe-inline usually carries.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${google('https://*.googletagmanager.com')}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data:${google('https://*.google-analytics.com https://*.googletagmanager.com')}`,
  "font-src 'self'",
  `connect-src 'self'${google('https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com')}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  // Dev needs unsafe-eval for hot reloading; keep the production policy strict
  ...(process.env.NODE_ENV === 'production'
    ? [{ key: 'Content-Security-Policy', value: contentSecurityPolicy }]
    : []),
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  // The site uses plain <img>, never next/image. The optimiser endpoint is
  // also refused outright (middleware.ts and worker.mjs), because it serves
  // files without consulting the passphrase gate.
  images: { unoptimized: true },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

export default withMDX(nextConfig)

// Makes Cloudflare bindings and .dev.vars available during `next dev`
initOpenNextCloudflareForDev()
