# Portfolio

A designer's portfolio: Next.js 15, React 19, Tailwind, MDX, deployed to
Cloudflare Workers via OpenNext. Dev server: `npm run dev` on port 4000
(the `portfolio` configuration in `.claude/launch.json`).

## First: is setup finished?

If `.portfolio-setup.json` does not exist, or its `phase` is below 10, the
owner has not finished setting up. Offer to start or continue the
`setup-portfolio` skill before anything else, and say which step it is on.

## Read before changing anything

1. **STANDARDS.md**: the design, engineering and security rules, and the
   checks that prove they hold. Changes must pass `npm run check` before
   they are committed.
2. **MECHANICS.md**: how the whole thing works, end to end.
3. **DECISIONS.md**: why things are the way they are. Add to it when you
   make a significant decision.
4. **GO-LIVE.md**: where the launch stands, and how deployment works.
5. **docs/DESIGN-BRIEF.md** (once setup step 4 has run): the owner's design
   direction. Design decisions follow it.
6. **docs/SECURITY.md**: what the passphrase protects and what it does not.

## Workflow

- **Start every session with `git pull`** (once the repository has a
  remote). Work on the `staging` branch.
- Pushes to `staging` build the staging Worker; pushes to `main` build the
  live site. Merge `staging` into `main` only through the `ship` skill,
  when the owner says "ship it".
- **The one exception is the `lockdown` skill**, which ships straight to
  production after one confirmation. It is the emergency lever and nothing
  else may skip staging.
- **Independent review.** Before anything ships, fresh `site-tester` and
  `security-reviewer` agents check it (the `ship` skill does this). Never
  review your own work in their place, and never continue an old reviewer
  agent: always dispatch a new one.
- After any change to how the site works, run `walkthrough-sync`.
- The commented `routes` block in `wrangler.jsonc` is the custom domain
  switch. Uncomment it only as the deliberate domain step; never remove it
  after that.

## Hard rules

- Facts, metrics, dates and quotes come from the owner, never invented.
  Quotes stay verbatim.
- Never print the values in `.env.local` or `.dev.vars`, and never type
  passwords or tokens on the owner's behalf.
- Colours come from tokens (`src/app/globals.css`, `tailwind.config.ts`,
  or a study's colour in `src/content/studies.ts`). No raw hex values in
  `src/app` or `src/components`.
- Content lives in `src/content/`; the engine in `src/lib/`,
  `src/middleware.ts`, `src/app/api/` and `scripts/`. Change the engine only
  when the owner asks for a change in behaviour, and never weaken a
  security invariant in STANDARDS.md section 4.
- The CV stays within two pages. `npm run cv` refuses to write a third.
  Tighten the content; if it cannot be tightened honestly, ask what to
  remove.
- Never run `next build` or `npm run build:cf` while the dev server is
  running.
- The GitHub repository stays private while any case study is protected:
  the full text of every study is in it.

## House style

Set by setup step 3. Until then: UK English.

<!-- setup-portfolio writes the owner's spelling and writing preferences here -->
