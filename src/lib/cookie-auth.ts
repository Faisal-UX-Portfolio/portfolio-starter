/**
 * Signed-cookie access for protected case studies and standalone protected
 * routes (see protected-routes.ts). The payload carries every slug granted
 * this session as a sorted, comma-joined list, so unlocking one protected
 * item does not sign the others out. New items can be protected just by
 * adding their slug wherever protectedSlugs/protectedRoutes is built from.
 * Runs on the Edge runtime, so it uses Web Crypto rather than Node's crypto
 * module.
 */

export const ACCESS_COOKIE = 'portfolio_access'

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

/** How long an unlock lasts. Enforced from the signed time, not the browser. */
export const MAX_AGE_SECONDS = 60 * 60 * 24
// Allowance for a clock slightly ahead of the one checking the cookie
const CLOCK_SKEW_SECONDS = 60

/**
 * The key cookies are signed with. It includes the passphrase, so changing
 * the passphrase signs everyone out, as does changing SESSION_SECRET.
 */
export function cookieKey(sessionSecret: string, passphrase: string): string {
  return `${sessionSecret}|${passphrase}`
}

// Underscore/comma separators keep the value cookie-safe: Next.js
// URL-encodes characters like ':' on write, which would break the
// comparison on read.
function payloadFor(slugs: string[], issuedAt: number): string {
  return `granted_${[...new Set(slugs)].sort().join(',')}_t${issuedAt}`
}

function parsePayload(payload: string): { slugs: string[]; issuedAt: number } | null {
  const match = /^granted_([a-z0-9,-]*)_t(\d{1,12})$/.exec(payload)
  if (!match) return null
  return { slugs: match[1] ? match[1].split(',') : [], issuedAt: Number(match[2]) }
}

/**
 * HMAC of an arbitrary value, for comparing secrets without leaking
 * timing: comparing two digests character-by-character reveals nothing
 * useful because an attacker cannot predict digest bytes.
 */
export async function hmacHex(secret: string, value: string): Promise<string> {
  const key = await importKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))
  return toHex(sig)
}

/** `now` is in milliseconds, like Date.now(); tests pass their own clock. */
export async function signCookieValue(secret: string, slugs: string[], now = Date.now()): Promise<string> {
  const payload = payloadFor(slugs, Math.floor(now / 1000))
  const key = await importKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return `${payload}.${toHex(sig)}`
}

async function verifiedSlugs(secret: string, value: string, now: number): Promise<string[] | null> {
  const dotIndex = value.lastIndexOf('.')
  if (dotIndex === -1) return null
  const payload = value.slice(0, dotIndex)
  const sigHex = value.slice(dotIndex + 1)
  // Exactly an HMAC-SHA256 in hex. Anything else is refused before it is
  // parsed, rather than parsed leniently (an odd trailing character used to
  // be dropped, and non-hex pairs read as zero).
  if (!/^[0-9a-f]{64}$/.test(sigHex)) return null
  try {
    const sigBytes = new Uint8Array(sigHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)))
    const key = await importKey(secret)
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(payload))
    if (!valid) return null
    const parsed = parsePayload(payload)
    if (!parsed) return null
    const { slugs, issuedAt } = parsed
    // Reject a payload that doesn't round-trip to its own canonical form
    // (e.g. unsorted or duplicated), since that would mean it was never
    // produced by signCookieValue.
    if (payload !== payloadFor(slugs, issuedAt)) return null
    // The browser is told to drop the cookie after a day, but a copied
    // cookie would otherwise work for ever. The signed time decides.
    const age = Math.floor(now / 1000) - issuedAt
    if (age > MAX_AGE_SECONDS || age < -CLOCK_SKEW_SECONDS) return null
    return slugs
  } catch {
    return null
  }
}

export async function verifyCookieValue(
  secret: string,
  slug: string,
  value: string,
  now = Date.now()
): Promise<boolean> {
  const slugs = await verifiedSlugs(secret, value, now)
  return slugs?.includes(slug) ?? false
}

/** The slugs already granted by a (possibly absent or invalid) cookie value. */
export async function grantedSlugsIn(secret: string, value: string | undefined, now = Date.now()): Promise<string[]> {
  if (!value) return []
  return (await verifiedSlugs(secret, value, now)) ?? []
}
