# Standards

The rules this project holds itself to, and the checks that prove they still
hold. Run the checks before committing. If a change genuinely needs to break
a rule, agree it with the owner first and update this file in the same
commit.

---

## 1. Non-negotiables

- **Facts come from the owner.** Metrics, outcomes, dates, clients and
  claims are never invented. If a number is not recorded somewhere, ask.
- **Quotes are verbatim.** Endorsements and testimonials may be trimmed with
  an ellipsis but never reworded.
- **Never print secrets.** `.env.local` and `.dev.vars` are gitignored; keep
  them that way.
- **Follow the house style** in `CLAUDE.md` for all copy, comments and
  commit messages.
- **Record significant decisions** in `DECISIONS.md` in the same piece of
  work that makes them.

## 2. Design standards

The design itself is the owner's, set out in `docs/DESIGN-BRIEF.md`. These
standards hold whatever the design is.

### Tokens
- Colours are declared in exactly three places: the neutral tokens in
  `src/app/globals.css`, the utilities in `tailwind.config.ts` that point at
  them, and each study's colour in `src/content/studies.ts`.
- **No raw hex values in `src/app` or `src/components`.** The one exception
  is `src/app/icon.svg`.
  ```bash
  grep -rn "#[0-9A-Fa-f]\{6\}" src/app src/components --include="*.tsx"   # must return nothing
  ```
- The token names components rely on stay: `paper`, `paper-raised`,
  `paper-sunken`, `ink`, `ink-soft`, `ink-faint`, `line`, `accent`,
  `accent-ink`, `accent-wash`. Their values are free to change.
- `--paper` and `--paper-raised` stay in the form `light-dark(#hex, #hex)`,
  which the contrast check reads.

### Accessibility (never regress)
- Text meets WCAG AA contrast (4.5:1, or 3:1 for large text) **in both light
  and dark**. `npm run check` measures every study colour against the
  canvas; check anything else you change programmatically, not by eye.
- Focus is restyled, never removed. Touch targets are at least 44px.
- Every animation respects `prefers-reduced-motion`, and the page must work
  if an animation never runs.
- No sideways scrolling at 375, 768 or 1440 wide, at 100% and 200% text
  size. Measure with `document.documentElement.scrollWidth` against
  `clientWidth` (never `window.innerWidth`, which grows with the bug). The
  usual causes: a grid with no base column (`grid-cols-[minmax(0,1fr)]`), a
  flex child without `min-w-0`, a long word in a heading, a wide table.
- Every image has alt text describing what it shows. In case studies the alt
  text is also the caption.
- Decorative elements carry `aria-hidden="true"`.

## 3. Engineering standards

### Where things live
- **Content** (the owner's): `src/content/site.ts`, `cv.ts`, `studies.ts`,
  `case-studies/*.mdx`, and images in `public/case-studies/<slug>/`.
- **Engine**: `src/lib/`, `src/middleware.ts`, `src/app/api/`, `scripts/`,
  `tests/`, `next.config.mjs`, `wrangler.jsonc`.
- **Design**: `src/app/globals.css`, `tailwind.config.ts`,
  `src/components/`, and the layout of pages in `src/app/`.
- A URL or fact typed into a page instead of read from `src/content/` is a
  defect.

### Hygiene
- No dead code. A component nothing imports is deleted; so is a dependency.
- Server components by default; `'use client'` only where interaction needs
  it. Native HTML (`<details>`, `<dialog>`) before JavaScript.
- Cookie values use unreserved characters only.
- Never run a production build while the dev server is running: they share
  `.next`. Stop the server, build, delete `.next`, restart.

### The checks
```bash
npm run check                  # types, lint, unit tests, content, security, smoke
npm run check -- --build       # plus the production build (dev server stopped)
npm run check -- --strict      # plus no placeholder or demo content: before going live
npm run check -- --url <url>   # smoke-test a deployed site
```
`npm run check` must pass before every commit that changes the site. The
smoke test needs the dev server running; a SKIPPED smoke test is not a pass.

### Independent review
Two agents in `.claude/agents/` review work the session did not do itself:
`site-tester` and `security-reviewer`. They are dispatched fresh, in
parallel, before anything ships (the `ship` skill does this), and at the end
of setup steps 6 and 8. A High security finding blocks deployment.

### Git
- Commit per logical change, with a message saying why.
- Work on `staging`. `main` is the live site and only changes through the
  `ship` skill, or `lockdown` in an emergency.

## 4. Security invariants (never weaken)

`npm run check:security` fails if any of these disappear from the code.

- **Protection is data-driven.** `protected: true` on a study in
  `src/content/studies.ts` is the only switch for a single study. The one
  other switch is `LOCKDOWN` in `src/lib/lockdown.ts`, operated only by the
  `lockdown` skill. Nothing may add a third.
- **A protected study covers its page, its one-pager and its images**, which
  must live in `public/case-studies/<slug>/`. Path matching is exact
  (`src/lib/paths.ts`): no prefix or substring tests.
- **Files outside the Worker.** Cloudflare serves `public/` before the
  Worker runs, except the prefixes in `run_worker_first` in
  `wrangler.jsonc`: `/case-studies/*`, `/documents/*`, `/one-pagers/*`, in
  both the production and staging blocks. Anything private under `public/`
  goes under one of those.
- **The unlock API keeps** its per-address rate limit (5 attempts per 10
  minutes), timing-safe comparison, 500ms delay after a failure, input
  validation with a length cap, and generic error messages.
- **The access cookie** stays HttpOnly, Secure in production, SameSite=Lax,
  signed with `SESSION_SECRET`.
- **The Content-Security-Policy** in `next.config.mjs` may gain directives
  but not lose them. Google's analytics hosts are added only when
  `NEXT_PUBLIC_GA_ID` is set. Any new third-party script, font or embed
  needs the policy extending, and a check in a real browser that nothing is
  blocked.
- **No raw HTML injection** except the theme script and JSON-LD (escaped by
  `jsonLd()`).
- **Secrets** live in `.env.local` locally and as Cloudflare secrets in
  production, never in the repository.
- **The repository stays private** while any study is protected.

## 5. Search engines and AI readers

- `/llms.txt`, `robots.txt` and `sitemap.xml` are generated from
  `src/content/`, so they cannot drift from the pages. Protected studies are
  left out of the sitemap and disallowed in robots.txt automatically.
- Every indexable page sets its own `title`, `description`, canonical
  (`alternates: { canonical: '/path' }`) and `openGraph` block with
  `images: ['/og-image.png']`.
- The layout emits Person structured data and each study emits Article
  structured data, both derived from `src/content/`.
- After a visual change to the brand, regenerate the share image:
  `npm run og`.
- Analytics (optional) runs under Google Consent Mode: no analytics cookie
  until the visitor accepts.

## 6. Before ending a session that changed the site

- `npm run check` passes, with the smoke test actually run.
- The pages you touched look right in the Browser pane at 375 and 1440 wide,
  in light and dark.
- The browser console is clean on those pages.
- If the CV content changed: `npm run cv`. If a study's facts changed:
  `npm run onepagers`. If the look changed: `npm run og`.
