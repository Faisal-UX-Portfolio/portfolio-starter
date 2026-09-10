/**
 * Prints each public case study's /one-pager route to public/one-pagers/.
 * Protected studies are skipped on purpose: a static PDF would sit outside
 * the passphrase. Their one-pager keeps a print button instead.
 *
 * The list of studies comes from src/content/studies.ts directly rather
 * than the sitemap, which is empty while the site is locked.
 *
 * Run with the dev server up: npm run onepagers
 * Rerun after changing any study's summary, outcome or endorsement.
 */
import { mkdir, rm } from 'node:fs/promises'
import puppeteer from 'puppeteer-core'
import { caseStudies } from '../src/content/studies.ts'
import { chromePath, readEnvLocal, gotoPastLock, LOCAL_URL } from './lib.mjs'

const BASE_URL = process.argv[2] ?? LOCAL_URL
const slugs = caseStudies.filter((cs) => !cs.protected).map((cs) => cs.slug)

const chrome = chromePath()
if (!chrome) throw new Error('Google Chrome was not found. Install it, or set CHROME_PATH.')
const env = await readEnvLocal()

// Start clean, so a study that was deleted or became protected does not
// leave a stale PDF behind in public/
await rm('public/one-pagers', { recursive: true, force: true })
await mkdir('public/one-pagers', { recursive: true })
const browser = await puppeteer.launch({ executablePath: chrome, headless: true })

try {
  const page = await browser.newPage()
  await page.emulateMediaType('print')
  for (const slug of slugs) {
    await gotoPastLock(browser, page, `${BASE_URL}/case-studies/${slug}/one-pager`, env.PORTFOLIO_PASSWORD)
    await page.evaluate(() => document.fonts.ready)
    await page.pdf({
      path: `public/one-pagers/${slug}.pdf`,
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    })
    console.log(`Wrote public/one-pagers/${slug}.pdf`)
  }
} finally {
  await browser.close()
}
