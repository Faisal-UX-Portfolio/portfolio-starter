/**
 * Shared helpers for the scripts in this folder. Nothing here prints a
 * secret: values read from .env.local are used, never logged.
 */
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

export const LOCAL_URL = 'http://localhost:4000'

/** Google Chrome (or Chromium), which puppeteer-core drives. Override with CHROME_PATH. */
export function chromePath() {
  return [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].find((p) => p && existsSync(p))
}

/** .env.local as an object. Missing file means an empty object. */
export async function readEnvLocal() {
  const text = await readFile('.env.local', 'utf8').catch(() => '')
  const env = {}
  for (const line of text.split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '')
  }
  return env
}

/** Whether anything answers at a URL. */
export async function isUp(url) {
  try {
    await fetch(url, { redirect: 'manual' })
    return true
  } catch {
    return false
  }
}

/** POSTs the passphrase for a slug and returns the access cookie's value. */
export async function unlockCookie(baseUrl, slug, password, headers = {}) {
  const res = await fetch(`${baseUrl}/api/unlock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ password, slug }),
  })
  if (!res.ok) throw new Error(`/api/unlock answered ${res.status} for slug "${slug}"`)
  const value = res.headers.get('set-cookie')?.match(/portfolio_access=([^;]+)/)?.[1]
  if (!value) throw new Error('/api/unlock succeeded but set no access cookie')
  return value
}

/**
 * Opens a page, getting past the site-wide lock first if it redirects there.
 *
 * A redirect to the unlock screen still answers 200, so a script that only
 * checked the status would happily photograph or print the lock screen.
 * This compares where the page actually landed with where it was sent.
 */
export async function gotoPastLock(browser, page, url, password) {
  const wanted = new URL(url)
  let res = await page.goto(url, { waitUntil: 'networkidle0' })
  if (new URL(page.url()).pathname === wanted.pathname) return res

  if (!password) throw new Error(`${url} redirected to ${page.url()} and .env.local has no PORTFOLIO_PASSWORD to unlock it with`)
  const slug = new URL(page.url()).pathname === '/unlock' ? 'site' : wanted.pathname.split('/')[2]
  const value = await unlockCookie(wanted.origin, slug, password)
  await browser.setCookie({ name: 'portfolio_access', value, domain: wanted.hostname, path: '/', secure: wanted.protocol === 'https:' })

  res = await page.goto(url, { waitUntil: 'networkidle0' })
  if (new URL(page.url()).pathname !== wanted.pathname) throw new Error(`Still landed on ${page.url()} after unlocking`)
  return res
}
