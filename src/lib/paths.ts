/**
 * Whether a request path falls under a protected base route, and is not
 * that route's own unlock screen.
 *
 * Both halves are exact on purpose. A bare `startsWith(base)` would also
 * match a different study whose slug merely begins the same way, and a
 * substring test for "/unlock" would let an image called `unlock-flow.png`
 * inside a protected study straight through.
 *
 * Kept in a file of its own, with no imports, so tests/paths.test.ts can
 * load it directly with Node.
 */
export function isUnderProtectedBase(pathname: string, base: string): boolean {
  if (pathname === `${base}/unlock`) return false
  return pathname === base || pathname.startsWith(`${base}/`)
}
