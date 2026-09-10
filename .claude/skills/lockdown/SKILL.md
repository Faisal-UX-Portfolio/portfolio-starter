---
name: lockdown
description: Emergency lever that puts the whole live site behind the four-word passphrase screen, and the reverse. Run when the owner says "Lockdown", "/lockdown", "lock the site", "take the site down", or "Reopen", "/reopen", "unlock the site". Flips one boolean in src/lib/lockdown.ts, runs the checks, then after a single confirmation ships straight to production and verifies the live site. The only thing allowed to skip staging. Built for speed under pressure: one confirmation, no interview.
---

# Lockdown

One boolean, `LOCKDOWN` in `src/lib/lockdown.ts`, decides whether the whole
live site sits behind the passphrase screen. "Lockdown" sets it `true`.
"Reopen" sets it `false`. Both directions run the same steps.

Everything else already exists: the signed cookie, the rate-limited unlock
API, the unlock screen, and the site-wide gate at the top of
`src/middleware.ts`. This skill only operates the switch.

The owner reaches for this when something has gone wrong: work shown that
should not have been, a client asking for something to come down, anything
urgent. Be fast, be clear, and do not ask anything you can work out.

## Ground rules

- **This is the one skill allowed to push straight to production.**
  Everything else goes staging first. Say so out loud every run, so the
  exception never becomes a habit.
- **One confirmation, then go.** State the direction and what visitors will
  see, wait for a yes, then run. Do not ask again at later steps.
- **Never skip the checks to go faster.** A failed build that never uploads
  costs a minute. A broken production deploy costs the afternoon.
- **If the passphrase itself has leaked**, locking the site behind that same
  passphrase achieves nothing. Say so immediately: the passphrase must be
  changed first, in `.env.local` and as a secret on **both** Cloudflare
  Workers, and a secret changed after a build only takes effect on the next
  build.
- Never print the values in `.env.local`.

## 1. Preflight

```bash
grep -n "^export const LOCKDOWN:" src/lib/lockdown.ts
git branch --show-current && git status --short && git pull
```

Read the current value before assuming the direction. If they say
"Lockdown" and it is already `true`, say so and ask whether they want it
verified or reopened.

**Stop and ask** if the working tree has uncommitted changes or the pull
conflicts. Shipping someone's half-finished work alongside the lock turns
one problem into two.

Work on `staging`: this skill ships whatever is checked out.

## 2. Flip the switch

Edit the one line:

```ts
export const LOCKDOWN: boolean = true   // or false to reopen
```

That is the only line this skill edits, in the only file it edits.

## 3. Confirm, once

In about four lines: which direction; what visitors will see (every page
redirects to the passphrase screen, including case study images, the CV and
the one-pagers; or, the site becomes fully public again); that this goes
straight to production; and roughly how long (about five minutes). Wait for
a yes.

## 4. Checks

```bash
npx tsc --noEmit && npm test --silent && node scripts/check-security.mjs
```

If any fail, say so and stop.

## 5. Ship

**Commit and push before any direct deploy, always.** Pushing `main`
starts a Cloudflare build that lands on production minutes later. Push first
and that build carries the same commit; deploy first and a stale build can
land afterwards and undo the switch.

```bash
git add src/lib/lockdown.ts && git commit -m "Lock the site behind the passphrase"   # or "Reopen the site"
git push origin staging
git checkout main && git merge --ff-only staging && git push origin main
git checkout staging
```

Then check whether Wrangler is signed in: `npx wrangler whoami`.

- **Signed in:** also run `npm run deploy`. It builds and uploads straight
  to the production Worker, usually well ahead of the Git build.
- **Not signed in:** the push is the whole mechanism. The change is live
  when Cloudflare's `main` build finishes, about five minutes. Tell them that
  is a wait, not a failure. Afterwards, mention once that running
  `npx wrangler login` in the Terminal makes future lockdowns faster.

## 6. Verify

The production address is in `.portfolio-setup.json` (`productionUrl`).
Wait until the change is live, then:

```bash
npm run smoke -- --url <productionUrl>
```

The smoke test detects the lock itself. Locked: every page and every study
image redirects to `/unlock`, and the passphrase opens everything. Open:
public pages answer, protected studies redirect to their own unlock pages.

**Then check again after six minutes.** A check that passes immediately
proves the upload worked, not that it stuck: an earlier build can still
land and overwrite it. If the state changes inside that window, deploy
again and say so.

## 7. Report

Short: the direction, how it shipped, what the smoke test showed. Say
explicitly that pushing to `main` was the deliberate exception to the
staging-first rule. Then how to undo it: "Reopen" runs the same steps the
other way.

## What this does not do

- It does not hide files under `public/` outside `/case-studies/`,
  `/documents/` and `/one-pagers/` (the favicon and social image stay
  reachable). Anything else that must be sealed needs its prefix adding to
  `run_worker_first` in `wrangler.jsonc`.
- It does not take the site offline entirely. For that, the Worker can be
  disabled in the Cloudflare dashboard.
- It does not change the passphrase. See the ground rules.
