/**
 * Smoke test: drives the running site like a visitor and checks that the
 * pages, the passphrase protection and the security headers all behave.
 *
 *   npm run smoke                    against the dev server on localhost:4000
 *   npm run smoke -- --url <url>     against a deployed site (staging or live)
 *
 * Detects whether the site is locked and tests the right behaviour for
 * either state. Reads the passphrase from .env.local and never prints it.
 */
import { existsSync, readdirSync } from 'node:fs'
import puppeteer from 'puppeteer-core'
import { caseStudies } from '../src/content/studies.ts'
import { site } from '../src/content/site.ts'
import { chromePath, readEnvLocal, unlockCookie, LOCAL_URL } from './lib.mjs'

const args = process.argv.slice(2)
const urlIndex = args.indexOf('--url')
const BASE = (urlIndex === -1 ? LOCAL_URL : args[urlIndex + 1]).replace(/\/$/, '')
const local = /^http:\/\/(localhost|127\.0\.0\.1)/.test(BASE)
const password = (await readEnvLocal()).PORTFOLIO_PASSWORD

let failures = 0
const ok = (message) => console.log(`  ok    ${message}`)
const fail = (message) => {
  failures++
  console.log(`  FAIL  ${message}`)
}
const expect = (condition, message) => (condition ? ok(message) : fail(message))
const note = (message) => console.log(`  note  ${message}`)

// Locally, each run gets its own made-up client address (from a range
// reserved for documentation), so the rate limiter's memory of an earlier
// run cannot lock this one out. Cloudflare sets this header itself on a
// deployed site, so sending it there changes nothing.
const fakeIp = () => `203.0.113.${1 + Math.floor(Math.random() * 254)}`
const clientHeaders = local ? { 'cf-connecting-ip': fakeIp() } : {}

async function get(path, cookie) {
  return fetch(`${BASE}${path}`, {
    redirect: 'manual',
    headers: { ...clientHeaders, ...(cookie ? { cookie: `portfolio_access=${cookie}` } : {}) },
  })
}
const redirectsTo = (res, path) =>
  [301, 302, 303, 307, 308].includes(res.status) && new URL(res.headers.get('location') ?? '', BASE).pathname === path

async function unlockAttempt(slug, pass, headers = clientHeaders) {
  return fetch(`${BASE}/api/unlock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ password: pass, slug }),
  })
}

function firstImage(slug, pattern = /\.(png|jpe?g|webp|gif|svg|avif)$/i) {
  const dir = `public/case-studies/${slug}`
  if (!existsSync(dir)) return undefined
  const file = readdirSync(dir).find((n) => pattern.test(n))
  return file && `/case-studies/${slug}/${file}`
}

try {
  await fetch(BASE, { redirect: 'manual' })
} catch {
  console.log(`Nothing answered at ${BASE}. Start the dev server (npm run dev) or pass --url.`)
  process.exit(1)
}

const locked = redirectsTo(await get('/'), '/unlock')
const publicStudies = caseStudies.filter((cs) => !cs.protected)
const protectedStudies = caseStudies.filter((cs) => cs.protected)
console.log(`Smoke test against ${BASE} (the site is ${locked ? 'LOCKED' : 'open'})\n`)

// Cookie a browser can use for the visual checks below
let grant

if (locked) {
  const everything = ['/', '/case-studies', '/about', '/certifications', '/cv', '/llms.txt', ...caseStudies.map((cs) => `/case-studies/${cs.slug}`)]
  for (const path of everything) expect(redirectsTo(await get(path), '/unlock'), `${path} redirects to /unlock while locked`)
  for (const study of caseStudies) {
    const image = firstImage(study.slug)
    if (image) expect(redirectsTo(await get(image), '/unlock'), `${image} is sealed while locked`)
  }
  expect((await get('/unlock')).status === 200, '/unlock answers 200')
  expect((await get('/robots.txt')).status === 200, '/robots.txt stays reachable')

  if (!password) {
    fail('No PORTFOLIO_PASSWORD in .env.local, so unlocking could not be tested')
  } else {
    grant = await unlockCookie(BASE, 'site', password, clientHeaders).catch(() => undefined)
    expect(Boolean(grant), 'the correct passphrase unlocks the site')
    if (grant) {
      expect((await get('/', grant)).status === 200, 'the home page answers 200 once unlocked')
      for (const study of protectedStudies) {
        expect((await get(`/case-studies/${study.slug}`, grant)).status === 200, `unlocking the site also opens ${study.slug}`)
      }
    }
  }
} else {
  // ── Public pages ──
  for (const path of ['/', '/case-studies', '/about', '/certifications', '/llms.txt', '/robots.txt', '/sitemap.xml']) {
    expect((await get(path)).status === 200, `${path} answers 200`)
  }
  for (const study of publicStudies) {
    expect((await get(`/case-studies/${study.slug}`)).status === 200, `public study ${study.slug} answers 200`)
    expect((await get(`/case-studies/${study.slug}/one-pager`)).status === 200, `its one-pager answers 200`)
    const image = firstImage(study.slug)
    if (image) expect((await get(image)).status === 200, `its image ${image} loads`)
  }
  expect((await get('/definitely-not-a-page')).status === 404, 'an unknown page answers 404')
  expect((await get('/case-studies/not-a-real-study')).status === 404, 'an unknown study answers 404')

  // ── Protected studies, without the passphrase ──
  for (const study of protectedStudies) {
    const unlock = `/case-studies/${study.slug}/unlock`
    expect(redirectsTo(await get(`/case-studies/${study.slug}`), unlock), `protected study ${study.slug} redirects to its unlock page`)
    expect(redirectsTo(await get(`/case-studies/${study.slug}/one-pager`), unlock), 'its one-pager is protected too')
    const image = firstImage(study.slug)
    if (image) expect(redirectsTo(await get(image), unlock), `its image ${image} is protected too`)
    // Disguised addresses for the same content must not get through either
    const hex = (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
    const disguised = [
      `/case-studies/${hex(study.slug[0])}${study.slug.slice(1)}`,
      `/case-studies/${study.slug.toUpperCase()}`,
      `/case-studies/${study.slug}%2Fone-pager`,
      ...(study.slug.includes('-') ? [`/case-studies/${study.slug.replace('-', '%2D')}`] : []),
      ...(image ? [image.replace(`${study.slug}/`, `${study.slug}%2F`), image.replace(study.slug, study.slug.toUpperCase())] : []),
    ]
    if (image) {
      const rest = image.slice('/case-studies/'.length)
      disguised.push(
        `/case-studies/x/..%2f${rest}`,
        `/x/..%2fcase-studies/${rest}`,
        `/case-studies/.%2f${rest}`,
        `/_next/static/..%2f..%2fcase-studies/${rest}`
      )
      if (study.slug.includes('s')) disguised.push(image.replace(study.slug, study.slug.replace('s', '%C5%BF')))
    }
    // The image optimiser fetches files without asking the gate; it must not exist
    const raster = firstImage(study.slug, /\.(png|jpe?g|webp|avif)$/i)
    if (raster) {
      disguised.push(
        `/_next/image?url=${encodeURIComponent(raster)}&w=640&q=75`,
        `/_next/image?url=${encodeURIComponent(`/_next/static/media/../..${raster}`)}&w=640&q=75`
      )
    } else {
      note(`${study.slug} has no PNG, JPEG, WebP or AVIF image, so the image optimiser probe was skipped`)
    }
    for (const path of disguised) {
      const res = await get(path)
      expect(res.status !== 200, `${path} does not bypass the passphrase (answered ${res.status})`)
    }

    const unlockPage = await get(unlock)
    expect(unlockPage.status === 200, 'its unlock page answers 200')
    expect(/<meta[^>]+name="robots"[^>]+noindex/.test(await unlockPage.text()), 'its unlock page tells search engines not to index it')
  }

  // ── The unlock API ──
  const target = protectedStudies[0]
  if (!target) {
    note('No protected studies, so the unlock flow was not tested')
  } else {
    if (local) {
      expect((await unlockAttempt('not-a-real-slug', 'aaaa-bbbb-cccc-dddd')).status === 400, 'an unknown slug is rejected with 400')
      const junk = await fetch(`${BASE}/api/unlock`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...clientHeaders }, body: '{not json' })
      expect(junk.status === 400, `a body that is not JSON is rejected with 400 (answered ${junk.status})`)
    }
    expect((await unlockAttempt(target.slug, 'not-the-real-passphrase')).status === 401, 'a wrong passphrase is rejected with 401')

    if (!password) {
      fail('No PORTFOLIO_PASSWORD in .env.local, so a correct unlock could not be tested')
    } else {
      const res = await unlockAttempt(target.slug, password)
      expect(res.status === 200, 'the correct passphrase is accepted')
      const setCookie = res.headers.get('set-cookie') ?? ''
      expect(/HttpOnly/i.test(setCookie), 'the access cookie is HttpOnly (page scripts cannot read it)')
      expect(/SameSite=Lax/i.test(setCookie), 'the access cookie is SameSite=Lax')
      if (BASE.startsWith('https')) expect(/;\s*Secure/i.test(setCookie), 'the access cookie is Secure (HTTPS only)')
      grant = setCookie.match(/portfolio_access=([^;]+)/)?.[1]

      if (grant) {
        expect((await get(`/case-studies/${target.slug}`, grant)).status === 200, 'with the cookie, the protected study answers 200')
        const image = firstImage(target.slug)
        if (image) expect((await get(image, grant)).status === 200, 'with the cookie, its image loads')
        const tampered = grant.slice(0, -1) + (grant.endsWith('0') ? '1' : '0')
        expect(redirectsTo(await get(`/case-studies/${target.slug}`, tampered), `/case-studies/${target.slug}/unlock`), 'a tampered cookie is rejected')
      }
    }

    if (local) {
      // A fresh address, so this burst does not disturb the checks above
      const burst = { 'cf-connecting-ip': fakeIp() }
      const statuses = []
      for (let i = 0; i < 6; i++) statuses.push((await unlockAttempt(target.slug, 'not-the-real-passphrase', burst)).status)
      expect(statuses[5] === 429, `the sixth wrong attempt in ten minutes is refused with 429 (got ${statuses.join(', ')})`)
    } else {
      note('The rate limit is only tested locally, so repeated live runs do not lock you out')
    }
  }

  // ── Headers and generated files ──
  const home = await get('/')
  expect(home.headers.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options is nosniff')
  expect(home.headers.get('x-frame-options') === 'DENY', 'X-Frame-Options is DENY')
  expect(Boolean(home.headers.get('referrer-policy')), 'a Referrer-Policy is set')
  const csp = home.headers.get('content-security-policy')
  if (csp) expect(csp.includes("frame-ancestors 'none'"), 'the Content-Security-Policy forbids framing')
  else if (local) note('No Content-Security-Policy in development; it is only sent by production builds')
  else fail('No Content-Security-Policy on a deployed site')

  const llms = await (await get('/llms.txt')).text()
  expect(llms.includes(site.name) && publicStudies.every((cs) => llms.includes(cs.title)), 'llms.txt names the owner and every public study')
}

// ── In a real browser: console errors and sideways scrolling ──
const chrome = chromePath()
if (!chrome) {
  note('Google Chrome not found, so the browser checks were skipped (set CHROME_PATH to enable them)')
} else {
  const browser = await puppeteer.launch({ executablePath: chrome, headless: true })
  try {
    const host = new URL(BASE).hostname
    if (grant) await browser.setCookie({ name: 'portfolio_access', value: grant, domain: host, path: '/', secure: BASE.startsWith('https') })

    const readable = caseStudies.filter((cs) => !cs.protected || grant)
    const paths = locked && !grant
      ? ['/unlock']
      : [
          '/', '/case-studies', '/about', '/certifications', '/cv',
          ...readable.map((cs) => `/case-studies/${cs.slug}`),
          ...readable.map((cs) => `/case-studies/${cs.slug}/one-pager`),
        ]

    // Light and dark at phone and desktop widths, then a phone at 200% text
    // size, which is where most sideways-scrolling bugs hide
    const passes = [
      ['light', 375, 100], ['light', 1440, 100], ['dark', 375, 100], ['dark', 1440, 100], ['light', 375, 200], ['light', 768, 200],
    ]
    for (const [scheme, width, textSize] of passes) {
      const page = await browser.newPage()
      await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }])
      await page.setViewport({ width, height: 900 })
      const problems = []
      page.on('pageerror', (err) => problems.push(err.message))
      page.on('console', (msg) => msg.type() === 'error' && problems.push(msg.text()))

      for (const path of paths) {
        problems.length = 0
        await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle0' })
        if (textSize !== 100) {
          await page.evaluate((size) => (document.documentElement.style.fontSize = `${size}%`), textSize)
          await new Promise((r) => setTimeout(r, 150))
        }
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        const where = `${path} at ${width}px, ${scheme}${textSize !== 100 ? `, ${textSize}% text` : ''}`
        if (overflow > 0) fail(`${where}: the page scrolls sideways by ${overflow}px`)
        if (problems.length) fail(`${where}: browser console errors: ${problems.slice(0, 3).join(' | ')}`)
      }
      await page.close()
    }
    ok(`browser checks ran on ${paths.length} page(s): 375px and 1440px in light and dark, and 375px and 768px at 200% text`)
  } finally {
    await browser.close()
  }
}

console.log(failures ? `\n${failures} smoke test failure(s).` : '\nSmoke test passed.')
process.exit(failures ? 1 : 0)
