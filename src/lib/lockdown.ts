/**
 * Emergency site-wide lockdown switch.
 *
 * Flip LOCKDOWN to true and deploy, and every page on the site sits behind
 * the same four-word passphrase screen the protected case studies use. Flip
 * it back to false to reopen. Nothing else in the repository should ever be
 * edited to lock or unlock the site.
 *
 * Operated by the `lockdown` skill (.claude/skills/lockdown/SKILL.md), which
 * runs the checks and the deploy. It is a build-time boolean rather than a
 * setting read at the edge, so changing it needs a redeploy (about five
 * minutes through Cloudflare's Git builds).
 *
 * Files under public/ are served by Cloudflare's asset layer before the
 * Worker runs, so the middleware only sees the prefixes listed in
 * `run_worker_first` in wrangler.jsonc: /case-studies/*, /documents/* and
 * /one-pagers/*. Everything else in public/ (the favicon, og-image.png) stays
 * reachable while locked. Put anything that must be sealed under one of those
 * prefixes.
 *
 * The `: boolean` annotation is deliberate. Without it TypeScript infers the
 * literal type `false`, and any `LOCKDOWN === true` elsewhere fails to
 * compile.
 */
export const LOCKDOWN: boolean = false

/** The grant slug the site-wide lock issues. It is not a case study. */
export const LOCKDOWN_SLUG = 'site'

/** Where the site-wide lock sends visitors without the passphrase. */
export const LOCKDOWN_PATH = '/unlock'

/**
 * The only paths that stay reachable while the site is locked: the lock
 * screen, the API behind it, and robots.txt and sitemap.xml, which have
 * their own lockdown branches saying "go away" and would go unread if they
 * were redirected too. Matched exactly, never by prefix.
 */
export const LOCKDOWN_OPEN_PATHS: ReadonlySet<string> = new Set([
  LOCKDOWN_PATH,
  '/api/unlock',
  '/robots.txt',
  '/sitemap.xml',
])
