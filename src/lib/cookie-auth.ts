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

// Underscore/comma separators keep the value cookie-safe: Next.js
// URL-encodes characters like ':' on write, which would break the
// comparison on read.
function payloadFor(slugs: string[]): string {
  return `granted_${[...new Set(slugs)].sort().join(',')}`
}

function slugsFromPayload(payload: string): string[] {
  if (!payload.startsWith('granted_')) return []
  const rest = payload.slice('granted_'.length)
  return rest ? rest.split(',') : []
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

export async function signCookieValue(secret: string, slugs: string[]): Promise<string> {
  const payload = payloadFor(slugs)
  const key = await importKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return `${payload}.${toHex(sig)}`
}

async function verifiedSlugs(secret: string, value: string): Promise<string[] | null> {
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
    const slugs = slugsFromPayload(payload)
    // Reject a payload that doesn't round-trip to its own canonical form
    // (e.g. unsorted or duplicated), since that would mean it was never
    // produced by signCookieValue.
    return payload === payloadFor(slugs) ? slugs : null
  } catch {
    return null
  }
}

export async function verifyCookieValue(
  secret: string,
  slug: string,
  value: string
): Promise<boolean> {
  const slugs = await verifiedSlugs(secret, value)
  return slugs?.includes(slug) ?? false
}

/** The slugs already granted by a (possibly absent or invalid) cookie value. */
export async function grantedSlugsIn(secret: string, value: string | undefined): Promise<string[]> {
  if (!value) return []
  return (await verifiedSlugs(secret, value)) ?? []
}
