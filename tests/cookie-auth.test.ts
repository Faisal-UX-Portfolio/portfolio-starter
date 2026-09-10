import { test } from 'node:test'
import assert from 'node:assert/strict'
import { signCookieValue, verifyCookieValue, grantedSlugsIn, hmacHex } from '../src/lib/cookie-auth.ts'

const SECRET = 'test-secret-that-is-long-enough-to-be-realistic-0123456789'

test('a signed cookie grants every slug it was signed for', async () => {
  const value = await signCookieValue(SECRET, ['study-b', 'study-a'])
  assert.equal(await verifyCookieValue(SECRET, 'study-a', value), true)
  assert.equal(await verifyCookieValue(SECRET, 'study-b', value), true)
})

test('it grants nothing it was not signed for', async () => {
  const value = await signCookieValue(SECRET, ['study-a'])
  assert.equal(await verifyCookieValue(SECRET, 'study-b', value), false)
  assert.equal(await verifyCookieValue(SECRET, 'site', value), false)
})

test('a cookie signed with a different secret is rejected', async () => {
  const value = await signCookieValue('another-secret-entirely-0123456789abcdef', ['study-a'])
  assert.equal(await verifyCookieValue(SECRET, 'study-a', value), false)
})

test('adding a slug to the payload breaks the signature', async () => {
  const value = await signCookieValue(SECRET, ['study-a'])
  const forged = value.replace('granted_study-a', 'granted_site,study-a')
  assert.equal(await verifyCookieValue(SECRET, 'site', forged), false)
})

test('altering the signature is rejected', async () => {
  const value = await signCookieValue(SECRET, ['study-a'])
  const flipped = value.slice(0, -1) + (value.endsWith('0') ? '1' : '0')
  assert.equal(await verifyCookieValue(SECRET, 'study-a', flipped), false)
})

test('a correctly signed but non-canonical payload is rejected', async () => {
  // signCookieValue always sorts and de-duplicates, so an unsorted payload
  // cannot have come from it, even if its signature is genuine
  const payload = 'granted_study-b,study-a'
  const value = `${payload}.${await hmacHex(SECRET, payload)}`
  assert.equal(await verifyCookieValue(SECRET, 'study-a', value), false)
})

test('malformed values are rejected rather than throwing', async () => {
  for (const value of ['', '.', 'granted_study-a', 'granted_study-a.', 'granted_study-a.zz', 'x.y', 'granted_.abc']) {
    assert.equal(await verifyCookieValue(SECRET, 'study-a', value), false, `accepted ${JSON.stringify(value)}`)
  }
})

test('grantedSlugsIn returns nothing for an absent or invalid cookie', async () => {
  assert.deepEqual(await grantedSlugsIn(SECRET, undefined), [])
  assert.deepEqual(await grantedSlugsIn(SECRET, 'nonsense'), [])
  const value = await signCookieValue(SECRET, ['study-a', 'study-a', 'site'])
  assert.deepEqual(await grantedSlugsIn(SECRET, value), ['site', 'study-a'])
})

test('hmacHex depends on both the secret and the value', async () => {
  const a = await hmacHex(SECRET, 'mint-oval-kite-drum')
  assert.equal(a, await hmacHex(SECRET, 'mint-oval-kite-drum'))
  assert.notEqual(a, await hmacHex(SECRET, 'mint-oval-kite-drux'))
  assert.notEqual(a, await hmacHex(`${SECRET}x`, 'mint-oval-kite-drum'))
})
