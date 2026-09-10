import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isUnderProtectedBase, normalisePath } from '../src/lib/paths.ts'

const BASE = '/case-studies/secret'

// Exactly what middleware.ts does with a request path
const gated = (raw: string) => {
  const path = normalisePath(raw)
  return path !== null && isUnderProtectedBase(path.toLowerCase(), BASE)
}

test('percent-encoding a character does not get past the gate', () => {
  for (const raw of [
    '/case-studies/s%65cret',
    '/case-studies/%73ecret/cover.png',
    '/case-studies/secret%2Fcover.png',
    '/case-studies/secret%2fone-pager',
    '/case-studies%2Fsecret',
  ]) {
    assert.equal(gated(raw), true, raw)
  }
})

test('case and doubled slashes do not get past the gate', () => {
  for (const raw of ['/case-studies/SECRET', '/Case-Studies/Secret/cover.png', '/case-studies//secret/cover.png']) {
    assert.equal(gated(raw), true, raw)
  }
})

test('malformed encoding is refused rather than guessed at', () => {
  assert.equal(normalisePath('/case-studies/secret%E0%A4%A'), null)
  assert.equal(normalisePath('/%'), null)
})

test('the study page, its sub-pages and its images are protected', () => {
  for (const path of [BASE, `${BASE}/`, `${BASE}/one-pager`, `${BASE}/cover.png`, `${BASE}/images/deep/flow.svg`]) {
    assert.equal(isUnderProtectedBase(path, BASE), true, path)
  }
})

test('its own unlock page is not, or nobody could ever reach it', () => {
  assert.equal(isUnderProtectedBase(`${BASE}/unlock`, BASE), false)
})

test('an image whose name merely contains "unlock" is still protected', () => {
  assert.equal(isUnderProtectedBase(`${BASE}/unlock-flow.png`, BASE), true)
  assert.equal(isUnderProtectedBase(`${BASE}/unlock/extra`, BASE), true)
})

test('a different study whose slug starts the same way is not caught', () => {
  assert.equal(isUnderProtectedBase('/case-studies/secret-garden', BASE), false)
  assert.equal(isUnderProtectedBase('/case-studies/secretive/cover.png', BASE), false)
})

test('unrelated paths are not caught', () => {
  for (const path of ['/', '/case-studies', '/case-studies/other', '/about']) {
    assert.equal(isUnderProtectedBase(path, BASE), false, path)
  }
})
