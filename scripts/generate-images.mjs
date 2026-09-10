/**
 * Photographs a hidden, noindexed route with the site's real fonts and
 * tokens:
 *   npm run og      /og at 1200x630     -> public/og-image.png (link previews)
 *   npm run banner  /banner at 1584x396 -> assets/linkedin-banner.png (2x)
 *
 * Run with the dev server up. Rerun after any visual change to the brand.
 */
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import puppeteer from 'puppeteer-core'
import { chromePath, readEnvLocal, gotoPastLock, LOCAL_URL } from './lib.mjs'

const TARGETS = {
  og: { route: '/og', out: 'public/og-image.png', width: 1200, height: 630, scale: 1 },
  banner: { route: '/banner', out: 'assets/linkedin-banner.png', width: 1584, height: 396, scale: 2 },
}

const target = TARGETS[process.argv[2]]
if (!target) throw new Error('Usage: node scripts/generate-images.mjs og|banner [baseUrl]')
const BASE_URL = process.argv[3] ?? LOCAL_URL

const chrome = chromePath()
if (!chrome) throw new Error('Google Chrome was not found. Install it, or set CHROME_PATH.')
const env = await readEnvLocal()

await mkdir(dirname(target.out), { recursive: true })
const browser = await puppeteer.launch({ executablePath: chrome, headless: true })

try {
  const page = await browser.newPage()
  await page.setViewport({ width: target.width, height: target.height, deviceScaleFactor: target.scale })
  await gotoPastLock(browser, page, `${BASE_URL}${target.route}`, env.PORTFOLIO_PASSWORD)
  await page.evaluate(() => document.fonts.ready)
  // The dev tools indicator must not end up in the picture
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' })
  await page.screenshot({ path: target.out, type: 'png' })
  console.log(`Wrote ${target.out}`)
} finally {
  await browser.close()
}
