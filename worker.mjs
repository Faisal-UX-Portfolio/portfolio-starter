/**
 * The Worker Cloudflare runs: OpenNext's generated worker, with the image
 * optimiser switched off in front of it.
 *
 * OpenNext answers /_next/image itself, before the middleware runs, by
 * fetching whatever file the url= parameter names. That would serve any
 * protected case study image (or, while locked, any image under
 * /documents/) to someone without the passphrase. The site never uses
 * next/image, so the endpoint simply does not exist.
 *
 * wrangler.jsonc points `main` here in both the production and staging
 * blocks; `npm run check:security` fails if either stops doing so.
 */
import handler from './.open-next/worker.js'

// OpenNext's Durable Object classes, re-exported so any binding to them
// keeps working
export * from './.open-next/worker.js'

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url)
    if (pathname === '/_next/image' || pathname.startsWith('/_next/image/')) {
      return new Response('Not found', { status: 404 })
    }
    return handler.fetch(request, env, ctx)
  },
}
