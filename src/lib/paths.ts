/**
 * Path matching for the passphrase gate. Kept in a file of its own, with no
 * imports, so tests/paths.test.ts can load it directly with Node.
 */

/**
 * The request path as the router will see it: percent-decoded, with runs of
 * slashes collapsed. Returns null for malformed encoding, which the
 * middleware rejects outright.
 *
 * Matching must happen on this, never on the raw path. Next.js decodes a
 * path before routing it and before serving a file, so a gate that compared
 * the still-encoded form let /case-studies/harbourline%2Dferries (and its
 * images) straight past the passphrase.
 */
export function normalisePath(raw: string): string | null {
  try {
    return decodeURIComponent(raw).replace(/\/{2,}/g, '/')
  } catch {
    return null
  }
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
