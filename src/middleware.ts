import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyCookieValue, ACCESS_COOKIE } from '@/lib/cookie-auth'
import { allProtectedSlugs, pathForSlug } from '@/lib/protected-routes'
import { isUnderProtectedBase, normalisePath } from '@/lib/paths'
import { LOCKDOWN, LOCKDOWN_SLUG, LOCKDOWN_PATH, LOCKDOWN_OPEN_PATHS } from '@/lib/lockdown'

/** Whether a valid cookie on this request already grants the given slug. */
async function hasGrant(request: NextRequest, slug: string): Promise<boolean> {
  const cookie = request.cookies.get(ACCESS_COOKIE)
  const secret = process.env.SESSION_SECRET
  if (!secret || !cookie?.value) return false
  return verifyCookieValue(secret, slug, cookie.value)
}

export async function middleware(request: NextRequest) {
  // Match on the path as Next.js will route it, decoded, never the raw
  // encoded form (see normalisePath). Malformed encoding is refused.
  const pathname = normalisePath(request.nextUrl.pathname)
  if (pathname === null) return new NextResponse('Bad request', { status: 400 })

  // Emergency site-wide lock (src/lib/lockdown.ts). Exact path matching:
  // a loose check guarding the whole site is a hole waiting to be found.
  if (
    LOCKDOWN &&
    !LOCKDOWN_OPEN_PATHS.has(pathname) &&
    !(await hasGrant(request, LOCKDOWN_SLUG))
  ) {
    return NextResponse.redirect(new URL(LOCKDOWN_PATH, request.url))
  }

  // A protected study covers its page, its one-pager and its images under
  // public/case-studies/<slug>/, which wrangler.jsonc routes through here.
  // Slugs are always lowercase and some file systems ignore case, so the
  // comparison does too: /case-studies/SECRET/cover.png must not slip past.
  const matchable = pathname.toLowerCase()
  const slug = allProtectedSlugs.find((s) => {
    const base = pathForSlug(s)
    return base !== undefined && isUnderProtectedBase(matchable, base)
  })
  if (!slug) return NextResponse.next()

  if (!(await hasGrant(request, slug))) {
    return NextResponse.redirect(new URL(`${pathForSlug(slug)}/unlock`, request.url))
  }

  return NextResponse.next()
}

// Deliberately wide, because the lockdown branch has to see every route.
// Next requires this to be statically analysable, so it cannot depend on
// LOCKDOWN; when the site is open the body is a cheap check with no I/O.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
