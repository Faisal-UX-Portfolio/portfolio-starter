import { NextRequest, NextResponse } from 'next/server'
import { signCookieValue, hmacHex, grantedSlugsIn, cookieKey, ACCESS_COOKIE, MAX_AGE_SECONDS } from '@/lib/cookie-auth'
import { allProtectedSlugs } from '@/lib/protected-routes'
import { LOCKDOWN_SLUG } from '@/lib/lockdown'

/**
 * Best-effort per-IP rate limit: 5 unlock attempts per 10 minutes.
 * In-memory, so on serverless it is per-isolate rather than global;
 * treat it as the inner layer and keep a Cloudflare rate limiting rule
 * on /api/unlock as the outer one (see DECISIONS.md).
 */
const WINDOW_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5
const attempts = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_ATTEMPTS) {
    attempts.set(ip, recent)
    return true
  }
  recent.push(now)
  attempts.set(ip, recent)
  if (attempts.size > 10_000) attempts.clear()
  return false
}

function clientIp(req: NextRequest): string {
  return (
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}

export async function POST(req: NextRequest) {
  try {
    if (rateLimited(clientIp(req))) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again in a few minutes.' },
        { status: 429 }
      )
    }

    // A body that is not JSON is a bad request, not a server error
    const body = await req.json().catch(() => null)
    const { password, slug } = body ?? {}

    if (
      !password ||
      typeof password !== 'string' ||
      password.length > 64 ||
      typeof slug !== 'string' ||
      !allProtectedSlugs.includes(slug)
    ) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const expected = process.env.PORTFOLIO_PASSWORD
    const secret = process.env.SESSION_SECRET
    if (!expected || !secret) {
      console.error('[unlock] PORTFOLIO_PASSWORD or SESSION_SECRET env var is not set')
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    // Compare HMAC digests rather than the raw strings so the comparison
    // cannot leak the password through response timing
    const matches =
      (await hmacHex(secret, password)) === (await hmacHex(secret, expected))

    if (!matches) {
      // Artificial delay to slow brute-force attempts further
      await new Promise((r) => setTimeout(r, 500))
      return NextResponse.json({ error: 'Incorrect passphrase' }, { status: 401 })
    }

    const key = cookieKey(secret, expected)
    const priorSlugs = await grantedSlugsIn(key, req.cookies.get(ACCESS_COOKIE)?.value)
    // Passing the site-wide lock grants everything: every protected item
    // shares one passphrase, so a second screen would add friction without
    // asking for any knowledge the visitor has not already proved.
    const granted = slug === LOCKDOWN_SLUG ? allProtectedSlugs : [slug]
    const cookieValue = await signCookieValue(key, [
      ...new Set([...priorSlugs, ...granted]),
    ])
    const response = NextResponse.json({ success: true })
    response.cookies.set(ACCESS_COOKIE, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: MAX_AGE_SECONDS,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[unlock] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
