/**
 * Security checks that can run without a server. Each one guards something
 * that would otherwise weaken silently: a secret committed by accident, a
 * rate limit loosened in passing, a protected folder dropped from the
 * Cloudflare config.
 *
 * These assert that protections are still present. They do not replace a
 * review: the security-reviewer agent reads the code itself.
 */
import { execSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { readEnvLocal } from './lib.mjs'

const errors = []
const warnings = []
const read = (file) => readFileSync(file, 'utf8')

// ── 1. Secrets never tracked by git ──
// Committed files plus new ones git would pick up, so this catches a
// secret before the commit that would publish it, not after
let tracked = []
try {
  tracked = execSync('git ls-files --cached --others --exclude-standard', { encoding: 'utf8' }).split('\n').filter(Boolean)
} catch {
  warnings.push('Not a git repository yet, so committed files could not be checked')
}

for (const file of tracked) {
  if (/(^|\/)(\.env(\.[^/]*)?|\.dev\.vars)$/.test(file) && !file.endsWith('.example')) {
    errors.push(`${file} is (or would be) committed to git, and it holds secrets. Add it to .gitignore, run "git rm --cached ${file}" if it was already committed, and rotate the values.`)
  }
}

const gitignore = existsSync('.gitignore') ? read('.gitignore').split('\n').map((l) => l.trim()) : []
for (const pattern of ['.env*.local', '.dev.vars']) {
  if (!gitignore.includes(pattern)) errors.push(`.gitignore must contain "${pattern}"`)
}

// ── 2. Nothing secret-shaped in any committed file ──
const env = await readEnvLocal()
const SECRET_SHAPES = [
  [/PORTFOLIO_PASSWORD\s*=\s*[a-z]{4}(-[a-z]{4}){3}/, 'a passphrase assignment'],
  [/SESSION_SECRET\s*=\s*\S{16,}/, 'a session secret assignment'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'a private key'],
  [/\bgh[pousr]_[A-Za-z0-9]{36}\b/, 'a GitHub token'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'an AWS access key'],
  [/\bsk-(ant-)?[A-Za-z0-9_-]{20,}\b/, 'an API key'],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}/, 'a Slack token'],
]
const BINARY = /\.(png|jpe?g|webp|gif|avif|ico|pdf|woff2?|ttf|otf|mp4|mov|zip)$/i
for (const file of tracked) {
  if (BINARY.test(file) || !existsSync(file) || statSync(file).size > 2_000_000) continue
  const text = read(file)
  for (const [pattern, label] of SECRET_SHAPES) {
    if (pattern.test(text)) errors.push(`${file} contains what looks like ${label}`)
  }
  // The real values, wherever they might have been pasted
  for (const key of ['PORTFOLIO_PASSWORD', 'SESSION_SECRET']) {
    if (env[key] && env[key].length >= 8 && text.includes(env[key])) errors.push(`${file} contains the real ${key} from .env.local`)
  }
}

// ── 3. The local secrets are sound ──
if (!existsSync('.env.local')) {
  warnings.push('.env.local does not exist yet, so the passphrase and session secret were not checked')
} else {
  if (!/^[a-z]{4}(-[a-z]{4}){3}$/.test(env.PORTFOLIO_PASSWORD ?? '')) {
    errors.push('PORTFOLIO_PASSWORD in .env.local must be four words of four lowercase letters joined by hyphens, the only shape the unlock screen accepts')
  }
  if ((env.SESSION_SECRET ?? '').length < 32) errors.push('SESSION_SECRET in .env.local must be at least 32 characters. Generate one with: openssl rand -hex 32')
  if (env.SESSION_SECRET && env.SESSION_SECRET === env.PORTFOLIO_PASSWORD) errors.push('SESSION_SECRET must not be the same as PORTFOLIO_PASSWORD')
}

// ── 4. The protections are still in the code ──
const mustContain = {
  'src/app/api/unlock/route.ts': [
    ['MAX_ATTEMPTS = 5', 'the rate limit of 5 attempts'],
    ['10 * 60 * 1000', 'the 10 minute rate limit window'],
    ['hmacHex(secret, password)', 'the timing-safe passphrase comparison'],
    ['setTimeout(r, 500)', 'the delay after a wrong passphrase'],
    ['password.length > 64', 'the passphrase length cap'],
    ['!allProtectedSlugs.includes(slug)', 'the check that the slug is a real protected item'],
    ['httpOnly: true', 'the HttpOnly cookie flag'],
    ["sameSite: 'lax'", 'the SameSite cookie flag'],
    ["secure: process.env.NODE_ENV === 'production'", 'the Secure cookie flag in production'],
  ],
  'src/lib/cookie-auth.ts': [
    ["crypto.subtle.verify('HMAC'", 'signature verification'],
    ['payload === payloadFor(slugs)', 'the canonical payload check'],
  ],
  'src/middleware.ts': [
    ['LOCKDOWN_OPEN_PATHS.has(pathname)', 'the exact-match lockdown allowlist'],
    ['normalisePath(request.nextUrl.pathname)', 'decoding the path before matching it'],
    ['isUnderProtectedBase(matchable, base)', 'the exact, case-insensitive protected path matching'],
  ],
  'src/lib/paths.ts': [['pathname === `${base}/unlock`', 'the exact unlock-page exemption']],
  'next.config.mjs': [
    ["frame-ancestors 'none'", 'the clickjacking protection in the CSP'],
    ["object-src 'none'", 'object-src none in the CSP'],
    ["base-uri 'self'", 'base-uri self in the CSP'],
    ['X-Content-Type-Options', 'the nosniff header'],
    ['Strict-Transport-Security', 'the HSTS header'],
    ['Referrer-Policy', 'the referrer policy header'],
  ],
}
for (const [file, needles] of Object.entries(mustContain)) {
  if (!existsSync(file)) {
    errors.push(`${file} is missing`)
    continue
  }
  const text = read(file)
  for (const [needle, what] of needles) {
    // A needle ending in a number must not match a longer number, or
    // "MAX_ATTEMPTS = 5" would happily accept a limit of 50
    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(/\d$/.test(needle) ? `${escaped}(?!\\d)` : escaped)
    if (!pattern.test(text)) errors.push(`${file} no longer contains ${what} (${needle})`)
  }
}

const lockdown = read('src/lib/lockdown.ts')
const openPaths = lockdown.match(/LOCKDOWN_OPEN_PATHS[^=]*=\s*new Set\(\[([\s\S]*?)\]\)/)?.[1]
const openCount = openPaths?.split(',').filter((s) => s.trim()).length
if (openCount !== 4) errors.push(`LOCKDOWN_OPEN_PATHS in src/lib/lockdown.ts should list exactly 4 paths, found ${openCount ?? 'none'}. Anything added there is reachable while the site is locked.`)

// Protected files under public/ are only covered if Cloudflare routes them
// through the Worker, in both the production and staging blocks
const wrangler = read('wrangler.jsonc')
for (const prefix of ['/case-studies/*', '/documents/*', '/one-pagers/*']) {
  const count = wrangler.split(`"${prefix}"`).length - 1
  if (count < 2) errors.push(`wrangler.jsonc must list "${prefix}" in run_worker_first for both production and staging (found ${count})`)
}

// Raw HTML injection is allowed only for the theme script and JSON-LD,
// which is escaped by jsonLd()
const ALLOWED_INNER_HTML = { 'src/app/layout.tsx': 2, 'src/app/case-studies/[slug]/page.tsx': 1 }
for (const file of tracked.filter((f) => f.startsWith('src/') && /\.(tsx|ts|mdx)$/.test(f))) {
  const count = read(file).split('dangerouslySetInnerHTML').length - 1
  if (count > (ALLOWED_INNER_HTML[file] ?? 0)) errors.push(`${file} uses dangerouslySetInnerHTML. Render text as text; only the theme script and escaped JSON-LD may inject HTML.`)
}

// Server secrets must never be read in code that runs in the browser
for (const file of tracked.filter((f) => f.startsWith('src/') && /\.tsx?$/.test(f))) {
  const text = read(file)
  if (/^['"]use client['"]/m.test(text) && /process\.env\.(?!NEXT_PUBLIC_|NODE_ENV)/.test(text)) {
    errors.push(`${file} is a browser component but reads a server environment variable`)
  }
}

// ── 5. Known vulnerabilities in the packages the live site runs ──
const audit = spawnSync('npm', ['audit', '--omit=dev', '--json'], { encoding: 'utf8' })
try {
  const counts = JSON.parse(audit.stdout).metadata.vulnerabilities
  const serious = (counts.high ?? 0) + (counts.critical ?? 0)
  if (serious) errors.push(`npm audit found ${serious} high or critical vulnerabilit${serious === 1 ? 'y' : 'ies'} in production packages. Run "npm audit" for details and "npm audit fix" to update.`)
  else if (counts.moderate) warnings.push(`npm audit found ${counts.moderate} moderate vulnerabilities in production packages`)
} catch {
  const reason = audit.stderr?.split('\n').find((l) => l.trim()) ?? 'no output'
  warnings.push(`npm audit could not run (${reason}), so package vulnerabilities were not checked`)
}

// ── Report ──
for (const w of warnings) console.log(`  warn  ${w}`)
for (const e of errors) console.log(`  FAIL  ${e}`)
console.log(errors.length ? `\n${errors.length} security problem(s).` : `Security checks passed${warnings.length ? ` with ${warnings.length} warning(s)` : ''}.`)
process.exit(errors.length ? 1 : 0)
