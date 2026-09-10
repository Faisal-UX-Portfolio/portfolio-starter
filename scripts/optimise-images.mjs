/**
 * Recompress every image under public/case-studies in place.
 *
 * No resizing: pixel dimensions are untouched, so nothing that is currently
 * visible on the page is lost, and the artefacts stay as zoomable as they
 * were. PNGs are written to a quantised palette, JPEGs through mozjpeg.
 * A file is only replaced when the result is genuinely smaller, and formats
 * other than PNG and JPEG are left alone.
 *
 * Rerun after adding new case study images:
 *   node scripts/optimise-images.mjs
 *
 * Originals are always recoverable from git history.
 */
import sharp from 'sharp'
import fs from 'node:fs'

const dir = 'public/case-studies'
let before = 0
let after = 0
let replaced = 0
let untouched = 0
const rows = []

for (const name of fs.readdirSync(dir, { recursive: true }).sort()) {
  const path = `${dir}/${name}`
  if (!fs.statSync(path).isFile()) continue
  const size = fs.statSync(path).size
  before += size

  const { format } = await sharp(path).metadata()
  if (format !== 'png' && format !== 'jpeg') {
    after += size
    untouched++
    continue
  }

  const buf =
    format === 'jpeg'
      ? await sharp(path).jpeg({ quality: 82, mozjpeg: true }).toBuffer()
      : await sharp(path).png({ quality: 80, compressionLevel: 9, palette: true }).toBuffer()

  if (buf.length < size) {
    fs.writeFileSync(path, buf)
    after += buf.length
    replaced++
    rows.push([name, size, buf.length])
  } else {
    after += size
    untouched++
  }
}

const mb = (b) => (b / 1048576).toFixed(1)
const kb = (b) => String(Math.round(b / 1024)).padStart(5)

console.log(`replaced ${replaced}, left alone ${untouched}`)
console.log(`${mb(before)} MB to ${mb(after)} MB (${Math.round((1 - after / before) * 100)}% smaller)`)
console.log('\nbiggest savings:')
rows
  .sort((a, b) => b[1] - b[2] - (a[1] - a[2]))
  .slice(0, 8)
  .forEach(([n, b, a]) => console.log(`  ${kb(b)}KB to ${kb(a)}KB  ${n}`))
