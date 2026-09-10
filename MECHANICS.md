# How it works

A plain-English tour of the whole site, end to end. The other documents are
authoritative on their own subjects; this one is the fastest way to find
your bearings.

## 1. The shape of it

Your site is a Next.js project: a set of pages written in React, styled with
Tailwind, with case studies written in MDX (Markdown that can include a few
interactive pieces). The code lives in a private GitHub repository.
Cloudflare watches that repository and, whenever something is pushed, builds
the site and publishes it to a Worker: a small program on Cloudflare's
network that answers visitors from a data centre near them.

There are two Workers. **Staging** is built from the `staging` branch and is
where every change appears first. **Production** is built from `main` and is
the live site. Saying "ship it" moves what is on staging to main.

## 2. Where the content lives

Everything about you is in `src/content/`:

- `site.ts`: your name, role, tagline, bio, email, LinkedIn, testimonials
- `cv.ts`: your CV and certifications
- `studies.ts`: the list of case studies and each one's facts (client, role,
  timeline, outcome, colour, whether it is protected)
- `case-studies/<slug>.mdx`: each study's story

Images for a study go in `public/case-studies/<slug>/`.

One edit goes a long way. Your name in `site.ts` reaches the navigation, the
footer, every page title, the structured data search engines read, the CV,
the one-pagers, the share image and `llms.txt`. A new entry in `cv.ts`
reaches the CV page, its PDF, the Certifications page and the home page.

### The generated files

Some files are made from the content rather than written by hand:

| Command | Makes | From |
|---|---|---|
| `npm run cv` | `public/documents/cv.pdf` | the `/cv` page |
| `npm run onepagers` | `public/one-pagers/<slug>.pdf` for each public study | each study's `/one-pager` page |
| `npm run og` | `public/og-image.png`, the picture in link previews | the hidden `/og` page |
| `npm run banner` | `assets/linkedin-banner.png` | the hidden `/banner` page |

Each drives Google Chrome against the running dev server, so the files use
your real fonts and colours. Protected studies get no PDF, because a file
would sit outside the passphrase.

`llms.txt`, `robots.txt` and `sitemap.xml` are generated when the site is
built, so they always match the pages.

## 3. What happens when someone visits

1. The visitor's browser asks Cloudflare for a page.
2. Most images and files in `public/` are served straight away. The
   exceptions are anything under `/case-studies/`, `/documents/` and
   `/one-pagers/`, which go through the Worker first so the passphrase can
   cover them.
3. The Worker runs the **middleware** (`src/middleware.ts`) before anything
   else:
   - If the site is **locked**, everything except the unlock screen sends
     the visitor to `/unlock`.
   - If the page belongs to a **protected study** (its page, its one-pager
     or one of its images), a visitor without the right cookie is sent to
     that study's unlock page.
   - Otherwise the page is served. Pages are built ahead of time, so this is
     fast.

### Unlocking

The unlock screen has four boxes for the four words of the passphrase. When
they are filled it sends them to `/api/unlock`, which:

- refuses more than five attempts from one address in ten minutes, and waits
  half a second after every wrong guess
- compares the passphrase in a way that leaks nothing through timing
- on success, sets a cookie that lasts 24 hours, signed with
  `SESSION_SECRET` so it cannot be forged or edited

One cookie can hold several unlocked studies. Unlocking a locked site
unlocks everything.

## 4. Light and dark

The site follows the visitor's device setting, and the control in the
navigation can pin light or dark. Every colour is a token in
`src/app/globals.css` written as `light-dark(light value, dark value)`, so
components never need to know which appearance is showing. Each case study
brings its own accent colour, applied to its pages through three tokens:
`--accent`, `--accent-ink` (for text) and `--accent-wash` (for backgrounds).

## 5. The checks

`npm run check` runs everything:

- **Types and lint**: the code is well formed
- **Unit tests** (`tests/`): the cookie signing and the protected path
  matching behave, including the ways they could be attacked
- **Content** (`scripts/check-content.mjs`): every study has its MDX file
  and images, every image has alt text, protected images are in the
  protected folder, and every study colour is readable in light and dark
- **Security** (`scripts/check-security.mjs`): no secrets in the
  repository, sound local secrets, every protection still present in the
  code, and no known vulnerabilities in the packages
- **Smoke test** (`scripts/smoke.mjs`): drives the running site like a
  visitor, including trying to get at protected studies without the
  passphrase, and checks every page in a real browser at phone and desktop
  widths, light and dark

Then two agents review the work: `site-tester`, which explores the site
looking for what the scripts miss, and `security-reviewer`, which reads the
code looking for ways around the protection. They did not write the code and
are started fresh each time, so they check rather than confirm.

## 6. Getting to live

1. Changes are committed to `staging` and pushed. Cloudflare builds the
   staging Worker in a few minutes.
2. You look at the staging address.
3. "Ship it" runs every check against staging, has both agents review the
   change, asks you once, then merges into `main`. Cloudflare builds the
   live site and the skill tests it.

Rolling back is one click in the Cloudflare dashboard (the Worker's
Deployments). See `GO-LIVE.md`.

## 7. The skills

| Skill | Say | What it does |
|---|---|---|
| `setup-portfolio` | "set up my portfolio" | The guided first-time setup |
| `new-case-study` | "add a case study" | Interviews you and adds a study |
| `new-cert` | "I've got a new certification" | Adds it, and updates the CV |
| `new-role` | "I've got a new job" | Updates your role everywhere |
| `ship` | "ship it" | Checks, reviews and puts staging live |
| `lockdown` | "Lockdown" / "Reopen" | The emergency lever |
| `walkthrough-sync` | "update the walkthrough" | Keeps the walkthrough true |

### Why lockdown is allowed to skip staging

Every other change goes through staging. Lockdown exists for the moment
something must come down now, so it ships straight to production after one
confirmation, and says so every time so the exception stays an exception.
It flips one line, and it pushes before it deploys, so a slower build from
an earlier push cannot land afterwards and undo it.

## 8. Cheat sheet

| I want to | Where |
|---|---|
| Change my bio or links | `src/content/site.ts` |
| Update my CV | `src/content/cv.ts`, then `npm run cv` |
| Edit a case study | `src/content/case-studies/<slug>.mdx` |
| Protect a case study | `protected: true` in `src/content/studies.ts` |
| Change the passphrase | `.env.local`, and the secret on both Workers, then rebuild |
| Change colours or fonts | `src/app/globals.css` |
| See what is live | `GO-LIVE.md`, release status |
