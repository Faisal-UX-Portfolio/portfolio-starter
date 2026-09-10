/**
 * Content checks: the things a person editing case studies can get wrong
 * without any code complaining.
 *
 * - Every study in src/content/studies.ts has an MDX file, and every MDX
 *   file has a study entry
 * - Every image a study references exists, and has alt text
 * - A protected study's images live under its own public/case-studies/<slug>/
 *   folder, the only place the passphrase covers them
 * - Study colours pass WCAG AA contrast in both appearances
 * - With --strict: no placeholder text, no demo studies, and the generated
 *   CV and social image exist (required before the first production deploy)
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { caseStudies } from '../src/content/studies.ts'
import { site } from '../src/content/site.ts'
import { cv } from '../src/content/cv.ts'

const strict = process.argv.includes('--strict')
const errors = []
const warnings = []
const strictly = (message) => (strict ? errors : warnings).push(message)

// ── Studies and their MDX files ──
const MDX_DIR = 'src/content/case-studies'
const mdxSlugs = readdirSync(MDX_DIR).filter((f) => f.endsWith('.mdx')).map((f) => f.slice(0, -4))
const slugs = caseStudies.map((cs) => cs.slug)

for (const slug of slugs) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) errors.push(`Study slug "${slug}" must be lowercase words joined by hyphens`)
  if (slugs.indexOf(slug) !== slugs.lastIndexOf(slug)) errors.push(`Study slug "${slug}" is used twice`)
  if (!mdxSlugs.includes(slug)) errors.push(`Study "${slug}" has no ${MDX_DIR}/${slug}.mdx`)
}
for (const slug of mdxSlugs) {
  if (!slugs.includes(slug)) errors.push(`${MDX_DIR}/${slug}.mdx has no entry in src/content/studies.ts`)
}

// ── Images ──
const publicFile = (url) => `public${decodeURI(url.split(/[?#]/)[0])}`

for (const study of caseStudies) {
  const folder = `/case-studies/${study.slug}/`
  const refs = [{ url: study.coverImage, alt: study.coverAlt, where: 'coverImage in studies.ts' }]

  const mdxPath = `${MDX_DIR}/${study.slug}.mdx`
  if (existsSync(mdxPath)) {
    const mdx = readFileSync(mdxPath, 'utf8')
    for (const m of mdx.matchAll(/!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g)) refs.push({ url: m[2], alt: m[1], where: mdxPath })
    for (const m of mdx.matchAll(/<ArtifactViewer[\s\S]*?\/>/g)) {
      const src = m[0].match(/src="([^"]+)"/)?.[1]
      const title = m[0].match(/title="([^"]*)"/)?.[1]
      if (src) refs.push({ url: src, alt: title, where: `${mdxPath} (ArtifactViewer)` })
    }
  }

  for (const { url, alt, where } of refs) {
    if (!url.startsWith('/')) {
      if (study.protected) errors.push(`${where}: ${url} is hosted elsewhere, so the passphrase cannot protect it. Put the image in public${folder}`)
      continue
    }
    if (!/^[A-Za-z0-9/._-]+$/.test(url.split(/[?#]/)[0])) {
      errors.push(`${where}: ${url} has characters the passphrase gate refuses (spaces, accents or symbols). Rename the file using letters, numbers and hyphens.`)
    }
    if (!existsSync(publicFile(url))) errors.push(`${where}: ${url} does not exist (looked for ${publicFile(url)})`)
    if (!alt || !alt.trim()) errors.push(`${where}: ${url} has no alt text. Describe what the image shows.`)
    if (!url.startsWith(folder)) {
      const message = `${where}: ${url} is outside public${folder}`
      if (study.protected) errors.push(`${message}. The passphrase only covers that folder, so this image is public.`)
      else warnings.push(`${message}. Keeping each study's images in its own folder makes protecting it later safe.`)
    }
  }
}

// ── Colour contrast (WCAG AA, 4.5:1 for text) ──
function parseColour(value) {
  const hex = value.trim().match(/^#([0-9a-f]{6})$/i)
  if (hex) return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16)).concat(1)
  const rgba = value.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/i)
  if (rgba) return [+rgba[1], +rgba[2], +rgba[3], rgba[4] === undefined ? 1 : +rgba[4]]
  return null
}
const over = ([r, g, b, a], [br, bg, bb]) => [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a), 1]
function luminance([r, g, b]) {
  const [R, G, B] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// The canvas colours come from the tokens in globals.css, whatever the design is
const css = readFileSync('src/app/globals.css', 'utf8')
const token = (name) => {
  const m = css.match(new RegExp(`--${name}:\\s*light-dark\\(\\s*([^,]+?)\\s*,\\s*([^;]+?)\\s*\\)\\s*;`))
  return m ? { light: parseColour(m[1]), dark: parseColour(m[2]) } : null
}
const paper = token('paper')
const raised = token('paper-raised')

if (!paper?.light || !paper?.dark || !raised?.light || !raised?.dark) {
  warnings.push('Could not read --paper and --paper-raised from globals.css as light-dark(#hex, #hex), so study colour contrast was not checked')
} else {
  for (const study of caseStudies) {
    const c = study.colour
    const ink = parseColour(c.ink)
    const glow = parseColour(c.glow)
    const wash = parseColour(c.wash)
    const washDark = parseColour(c.washDark)
    if (!ink || !glow || !wash || !washDark || !parseColour(c.accent)) {
      errors.push(`Study "${study.slug}": every colour must be #rrggbb or rgba(...)`)
      continue
    }
    const pairs = [
      ['ink on the light page', ink, paper.light],
      ['ink on a light card', ink, raised.light],
      ['ink on the light wash (outcome box)', ink, over(wash, paper.light)],
      ['glow on the dark page', glow, paper.dark],
      ['glow on a dark card', glow, raised.dark],
      ['glow on the dark wash (outcome box)', glow, over(washDark, paper.dark)],
    ]
    for (const [label, fg, bg] of pairs) {
      const ratio = contrast(fg, bg)
      if (ratio < 4.5) errors.push(`Study "${study.slug}": ${label} is ${ratio.toFixed(2)}:1, below the 4.5:1 WCAG AA minimum`)
    }
  }
}

// ── Placeholders and demo content ──
const PLACEHOLDERS = [
  'Your Name', 'you@example.com', 'your-profile', 'example.workers.dev', 'City, Country',
  'One sentence on', 'A short paragraph', 'A second paragraph',
  'placeholder', 'Example Company', 'Another Example', 'Example Institute', 'example.com/verify',
]
const haystacks = { 'src/content/site.ts': JSON.stringify(site), 'src/content/cv.ts': JSON.stringify(cv) }
for (const [file, text] of Object.entries(haystacks)) {
  const found = PLACEHOLDERS.filter((p) => text.toLowerCase().includes(p.toLowerCase()))
  if (found.length) strictly(`${file} still has placeholder content: ${found.map((f) => `"${f}"`).join(', ')}`)
}
const demos = caseStudies.filter((cs) => cs.demo)
if (demos.length) strictly(`Demo case studies are still in: ${demos.map((cs) => cs.slug).join(', ')}. Delete them before going live.`)
if (!existsSync('public/documents/cv.pdf')) strictly('public/documents/cv.pdf does not exist yet, so every Download CV link is broken. Run npm run cv.')
if (!existsSync('public/og-image.png')) strictly('public/og-image.png does not exist yet, so link previews have no image. Run npm run og.')

// ── Report ──
for (const w of warnings) console.log(`  warn  ${w}`)
for (const e of errors) console.log(`  FAIL  ${e}`)
console.log(errors.length ? `\n${errors.length} content problem(s).` : `Content checks passed${warnings.length ? ` with ${warnings.length} warning(s)` : ''}.`)
process.exit(errors.length ? 1 : 0)
