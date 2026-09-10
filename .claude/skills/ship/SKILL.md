---
name: ship
description: Put what is on the staging branch live. Run when the owner says "ship it", "/ship", "go live", "publish it" or "put it live". Checks everything, has fresh agents test and security-review the change, confirms once, merges staging into main, waits for Cloudflare's production build and tests the live site. Never runs without that single confirmation.
---

# Ship it

Every change reaches the live site the same way: it lands on `staging`, the
owner looks at it on the staging address, and they say "ship it". This skill
is that last step. It is deliberately careful: a few minutes of checking is
cheaper than an afternoon of fixing the live site.

Addresses are in `.portfolio-setup.json` (`stagingUrl`, `productionUrl`).

## 1. Preflight

```bash
git fetch origin && git status --short && git branch --show-current
git log --oneline origin/main..origin/staging
```

- Be on `staging` with a clean working tree, level with `origin/staging`.
  If there is uncommitted work, stop and ask what it is.
- If `origin/main..origin/staging` is empty, there is nothing to ship: say
  so in one line and stop.
- **The repository must be private while any study is protected**, because
  it holds the full text of every study:
  ```bash
  gh repo view --json visibility -q .visibility
  grep -c "protected: true" src/content/studies.ts
  ```
  If there is a protected study and the answer is not `PRIVATE`, stop. Ask
  the owner to make it private (the repository's Settings on GitHub, at the
  bottom) before anything ships.

## 2. Check

With the dev server running (start it with `preview_start` if needed):

```bash
npm run check -- --strict
npm run check -- --strict --url <stagingUrl>
```

Both must pass. `--strict` fails on placeholder or demo content, which must
never reach the live site.

Then dispatch **fresh** `site-tester` and `security-reviewer` agents in one
message, so they run in parallel:

- `site-tester`: test the staging URL.
- `security-reviewer`: review `git diff origin/main...origin/staging`.

If either reports a failure or a High finding, stop. Fix it on `staging`,
push, and start this skill again from the top. Do not argue a finding away
to get the release out.

## 3. Confirm, once

Tell the owner, in a few lines: what is going live (summarise the commits
in plain English), that both reviews came back clean, and that the live
site updates in about five minutes. Wait for a clear yes.

## 4. Merge and push

```bash
git checkout main && git pull --ff-only origin main
git merge --ff-only staging
git push origin main
git checkout staging
```

If the fast-forward fails, `main` has changes `staging` does not. Stop and
explain; do not force anything.

## 5. Verify the live site

Cloudflare builds `main` and deploys it, usually within five minutes. Poll
until the new version is live, then test it:

```bash
npm run check -- --url <productionUrl>
```

If the smoke test fails on the live site, say so plainly, and offer the two
ways back: fix forward on `staging` and ship again, or roll back in the
Cloudflare dashboard (the Worker's Deployments tab can restore the previous
version in one click). If the problem is exposure of something private,
suggest "Lockdown" first and debugging second.

## 6. Report

Two or three lines: what went live, that the live checks passed, and the
address. If the walkthrough might now be out of date, run `walkthrough-sync`.
