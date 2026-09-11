import { test } from 'node:test'
import assert from 'node:assert/strict'
import { signCookieValue, verifyCookieValue, grantedSlugsIn, hmacHex, cookieKey } from '../src/lib/cookie-auth.ts'

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
  const forged = value.replace('granted_study-a_', 'granted_site,study-a_')
  assert.notEqual(forged, value)
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
  const t = Math.floor(Date.now() / 1000)
  for (const payload of [`granted_study-b,study-a_t${t}`, `granted_study-a_t0${t}`, 'granted_study-a']) {
    const value = `${payload}.${await hmacHex(SECRET, payload)}`
    assert.equal(await verifyCookieValue(SECRET, 'study-a', value), false, payload)
  }
})

test('a cookie stops working after 24 hours, whatever the browser does', async () => {
  const issued = Date.UTC(2026, 0, 1)
  const value = await signCookieValue(SECRET, ['study-a'], issued)
  const hour = 60 * 60 * 1000
  assert.equal(await verifyCookieValue(SECRET, 'study-a', value, issued + 23 * hour), true)
  assert.equal(await verifyCookieValue(SECRET, 'study-a', value, issued + 24 * hour + 1000), false)
  assert.deepEqual(await grantedSlugsIn(SECRET, value, issued + 25 * hour), [])
})

test('a cookie issued in the future is refused beyond a minute of clock drift', async () => {
  const now = Date.UTC(2026, 0, 1)
  assert.equal(await verifyCookieValue(SECRET, 'study-a', await signCookieValue(SECRET, ['study-a'], now + 30_000), now), true)
  assert.equal(await verifyCookieValue(SECRET, 'study-a', await signCookieValue(SECRET, ['study-a'], now + 120_000), now), false)
})

test('changing the passphrase or the session secret signs everyone out', async () => {
  const value = await signCookieValue(cookieKey(SECRET, 'mint-oval-kite-drum'), ['study-a'])
  assert.equal(await verifyCookieValue(cookieKey(SECRET, 'mint-oval-kite-drum'), 'study-a', value), true)
  assert.equal(await verifyCookieValue(cookieKey(SECRET, 'mint-oval-kite-drux'), 'study-a', value), false)
  assert.equal(await verifyCookieValue(cookieKey(`${SECRET}x`, 'mint-oval-kite-drum'), 'study-a', value), false)
})

test('a signature with an extra or altered character is rejected', async () => {
  const value = await signCookieValue(SECRET, ['study-a'])
  for (const forged of [`${value}0`, `${value}z`, value.slice(0, -2) + 'zz', value.toUpperCase()]) {
    assert.equal(await verifyCookieValue(SECRET, 'study-a', forged), false, forged)
  }
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
