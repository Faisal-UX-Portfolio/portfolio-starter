/**
 * Prints the /cv page to public/documents/cv.pdf, the file every "Download
 * CV" link points at. Content lives in src/content/cv.ts and
 * src/content/site.ts: edit there, rerun this, commit both.
 *
 * Refuses to write a CV longer than two pages. A reader skims page two and
 * rarely reaches page three, and the overflow is invisible until someone
 * opens the PDF.
 *
 * Run with the dev server up: npm run cv
 */
import { mkdir, writeFile } from 'node:fs/promises'
import puppeteer from 'puppeteer-core'
import { chromePath, readEnvLocal, gotoPastLock, LOCAL_URL } from './lib.mjs'

const BASE_URL = process.argv[2] ?? LOCAL_URL
const OUT = 'public/documents/cv.pdf'

const chrome = chromePath()
if (!chrome) throw new Error('Google Chrome was not found. Install it, or set CHROME_PATH.')
const env = await readEnvLocal()

await mkdir('public/documents', { recursive: true })
const browser = await puppeteer.launch({ executablePath: chrome, headless: true })

try {
  const page = await browser.newPage()
  await page.emulateMediaType('print')
  const res = await gotoPastLock(browser, page, `${BASE_URL}/cv`, env.PORTFOLIO_PASSWORD)
  if (!res?.ok()) throw new Error(`GET ${BASE_URL}/cv answered ${res?.status()}`)
  await page.evaluate(() => document.fonts.ready)

  // Rendered to a buffer first, so a CV that fails the page check never
  // lands on disk to be committed by accident
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '14mm', bottom: '14mm', left: '14mm', right: '14mm' },
  })
  const pages = Buffer.from(pdf).toString('latin1').match(/\/Type\s*\/Page[^s]/g)?.length ?? 0
  if (pages > 2) {
    throw new Error(
      `The CV came to ${pages} pages and was not written. It must not exceed two. ` +
        'Tighten the content in src/content/cv.ts. If nothing can go without losing ' +
        'something real, ask the owner what to cut rather than shrinking the type.'
    )
  }

  await writeFile(OUT, pdf)
  console.log(`Wrote ${OUT} (${pages} page${pages === 1 ? '' : 's'})`)
} finally {
  await browser.close()
}
