/**
 * npm run check: every automated check, in one command, with a summary.
 *
 *   npm run check                  types, lint, unit tests, content, security, smoke
 *   npm run check -- --strict      also fails on placeholder and demo content
 *                                  (required before the first production deploy)
 *   npm run check -- --build       also runs the production build
 *                                  (the dev server must be stopped first)
 *   npm run check -- --url <url>   smoke-tests a deployed site instead of localhost
 *
 * Every step runs even if an earlier one fails, so one run shows everything
 * that needs fixing. The exit code is non-zero if anything failed.
 */
import { spawnSync } from 'node:child_process'
import { isUp, LOCAL_URL } from './lib.mjs'

const args = process.argv.slice(2)
const strict = args.includes('--strict')
const build = args.includes('--build')
const urlIndex = args.indexOf('--url')
const url = urlIndex === -1 ? undefined : args[urlIndex + 1]

const steps = [
  ['Types', 'npx', ['tsc', '--noEmit']],
  ['Lint', 'npx', ['next', 'lint', '--quiet']],
  ['Unit tests', 'npm', ['test', '--silent']],
  ['Content', 'node', ['scripts/check-content.mjs', ...(strict ? ['--strict'] : [])]],
  ['Security', 'node', ['scripts/check-security.mjs']],
]

const devUp = await isUp(LOCAL_URL)
const results = []

for (const [name, cmd, cmdArgs] of steps) {
  console.log(`\n── ${name} ──`)
  const { status } = spawnSync(cmd, cmdArgs, { stdio: 'inherit' })
  results.push([name, status === 0 ? 'pass' : 'FAIL'])
}

if (build) {
  console.log('\n── Production build ──')
  if (devUp) {
    // The dev server and the build share .next; building under a running
    // server corrupts what it serves
    console.log('Refusing to build while the dev server is running on port 4000. Stop it, then run this again.')
    results.push(['Production build', 'FAIL'])
  } else {
    const { status } = spawnSync('npm', ['run', 'build:cf'], { stdio: 'inherit' })
    results.push(['Production build', status === 0 ? 'pass' : 'FAIL'])
    console.log('After a build, delete the .next folder before starting the dev server again.')
  }
}

console.log('\n── Smoke test ──')
if (url || devUp) {
  const { status } = spawnSync('node', ['scripts/smoke.mjs', ...(url ? ['--url', url] : [])], { stdio: 'inherit' })
  results.push(['Smoke test', status === 0 ? 'pass' : 'FAIL'])
} else {
  console.log(`Nothing is answering at ${LOCAL_URL}. Start the dev server (npm run dev) and run this again to include the smoke test.`)
  results.push(['Smoke test', 'SKIPPED'])
}

console.log('\n── Summary ──')
for (const [name, result] of results) console.log(`${result.padEnd(8)} ${name}`)

const failed = results.some(([, r]) => r === 'FAIL')
const skipped = results.some(([, r]) => r === 'SKIPPED')
console.log(failed ? '\nSomething failed. Fix it before committing.' : skipped ? '\nPassed, but not everything ran.' : '\nEverything passed.')
process.exit(failed ? 1 : 0)
