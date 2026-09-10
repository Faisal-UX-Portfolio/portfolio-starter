/**
 * Creates .env.local with a fresh passphrase and session secret, without
 * ever printing either. Refuses to overwrite an existing file.
 *
 *   node scripts/new-env.mjs
 *
 * The passphrase is four words from a short list of friendly, unambiguous
 * four-letter words: you will read it out to people, so it should be easy
 * to say and impossible to mishear as something rude. To see it, open
 * .env.local (on a Mac: open -e .env.local).
 */
import { randomBytes, randomInt } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const WORDS = `atom bake balm band bark barn bead beam bean bear bell belt bend bird blue boat bold bolt
bone book boot bowl brim buoy calm camp cape card cart cave chip city clay clip coal coat code coin cold
cone cook cool cord corn cove crab crew cube curl dart dawn deck deer desk dial dice disc dock dome door
dove drum duck dune dust echo edge epic fair farm fawn fern film fire fish flag flax flip foam fold folk
font fork form fort frog fuel gale game gate gear gift glow glue goal gold golf grin grip hail half hall
harp hawk haze heap herb hill hint hive hood hook horn hull icon idea inch iris iron isle jade jazz jolt
kale keel kelp kite kiwi knit knot lace lake lamp lane lark lava lawn leaf lens lily lime line link lion
loaf loom lute malt mane mask mast maze meal mesa mild milk mill mint mist moat mode moon moss moth nest
note oaks oath oval oven palm park path peak pear pine pink plum poem pond pony pool port quay quiz raft
rail rain reed reef ring road robe rock roof rope rose ruby rust sage sail salt sand seal seed silk sing
snow soap sock sofa song soup star stem surf swan tale tart teal tide tile toad tree tuba tune twig vase
veil vine wave wick wind wing wolf wool yarn yoga zest zinc zone`.split(/\s+/)

if (existsSync('.env.local')) {
  console.log('.env.local already exists, so it was left alone.')
  process.exit(0)
}

const passphrase = Array.from({ length: 4 }, () => WORDS[randomInt(WORDS.length)]).join('-')
const secret = randomBytes(32).toString('hex')

const contents = readFileSync('.env.local.example', 'utf8')
  .replace(/^PORTFOLIO_PASSWORD=.*$/m, `PORTFOLIO_PASSWORD=${passphrase}`)
  .replace(/^SESSION_SECRET=.*$/m, `SESSION_SECRET=${secret}`)

// Readable by this user only
writeFileSync('.env.local', contents, { mode: 0o600 })
console.log('Created .env.local with a new passphrase and session secret. Open the file to see the passphrase.')
