/**
 * Path matching for the passphrase gate. Kept in a file of its own, with no
 * imports, so tests/paths.test.ts can load it directly with Node.
 */

/**
 * The request path as the router and the file server will see it:
 * percent-decoded, with runs of slashes collapsed. Returns null for any
 * path that could mean something other than what it says, which the
 * middleware refuses with a 400.
 *
 * Matching must happen on this, never on the raw path. Next.js decodes a
 * path before routing it and before serving a file, so a gate comparing the
 * still-encoded form let /case-studies/harbourline%2Dferries through. And
 * because an encoded slash hides a `..` from the URL parser, decoding alone
 * is not enough: /case-studies/x/..%2fharbourline-ferries/cover.svg decodes
 * to a path the file server resolves to the protected image.
 *
 * So after decoding, anything no legitimate address on this site needs is
 * refused outright rather than interpreted: dot segments and backslashes
 * (both are ways of walking to another folder), and anything outside
 * printable ASCII (Unicode letters that a case-insensitive file system
 * folds into ordinary ones, spaces, control characters).
 */
export function normalisePath(raw: string): string | null {
  let path: string
  try {
    path = decodeURIComponent(raw)
  } catch {
    return null
  }
  if (/[^\x21-\x7e]/.test(path) || path.includes('\\') || /(^|\/)\.\.?(\/|$)/.test(path)) return null
  return path.replace(/\/{2,}/g, '/')
}

/**
 * Whether a (normalised) path falls under a protected base route, and is
 * not that route's own unlock screen.
 *
 * Both halves are exact on purpose. A bare `startsWith(base)` would also
 * match a different study whose slug merely begins the same way, and a
 * substring test for "/unlock" would let an image called `unlock-flow.png`
 * inside a protected study straight through.
 */
export function isUnderProtectedBase(pathname: string, base: string): boolean {
  if (pathname === `${base}/unlock`) return false
  return pathname === base || pathname.startsWith(`${base}/`)
}
