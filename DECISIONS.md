# Decisions

Why things are the way they are. Newest at the top of each section. Add an
entry whenever a decision would puzzle someone reading the code later: what
was decided, what else was considered, and why.

## Your decisions

<!-- setup-portfolio and later sessions add entries here, newest first -->

## Inherited from the template

### One shared passphrase, not one per person
Every protected study and the site-wide lockdown use the same four-word
passphrase. Considered: a password per study, or accounts per visitor.
Chosen because a portfolio's passphrase is handed to recruiters in an email,
and one easy-to-say phrase is what gets used. Unlocking the whole site while
it is locked unlocks every study too, since a second screen would ask for
knowledge the visitor has already proved.

### A build-time lockdown switch
`LOCKDOWN` in `src/lib/lockdown.ts` is a constant, so changing it needs a
deploy (about five minutes). Considered: a flag read at the edge for an
instant switch. Rejected because it adds a storage dependency and a runtime
failure mode to the one lever that must work under pressure. The `lockdown`
skill makes the five minutes reliable.

### Protected study images live with the study
Images go in `public/case-studies/<slug>/`, and `/case-studies/*` is routed
through the Worker (`run_worker_first` in `wrangler.jsonc`), so a protected
study's images are covered by the same passphrase as its page. The cost is a
Worker invocation per study image, which is well within the free plan for a
portfolio.

### Exact path matching for protection, on the decoded path
`src/lib/paths.ts` matches a protected study's path exactly: the path
itself, or anything below it, never a mere prefix, and exempts only the
exact unlock page. A prefix test would catch a different study whose name
starts the same way; a substring test for "/unlock" would let an image named
`unlock-flow.png` through.

The match runs on the path after percent-decoding and with case ignored,
because that is the path Next.js actually routes and serves. The first
independent security review found that matching the raw path let
`/case-studies/harbourline%2Dferries` read a protected study in full,
images included. `tests/paths.test.ts` and the smoke test both try disguised
addresses now.

The second review showed decoding alone was not enough. An encoded slash
hides `..` from the URL parser, so `/case-studies/x/..%2fharbourline-ferries/cover.svg`
passed the match and the file server then walked to the protected image. The
middleware now refuses, with a 400, any decoded path containing a dot
segment, a backslash or a character outside printable ASCII: no legitimate
address on the site needs them, and refusing is safer than interpreting.
Image file names are held to the same rule by `npm run check`.

### The image optimiser is switched off
Next.js's `/_next/image` endpoint fetches whatever local file its `url=`
parameter names, and OpenNext answers it before the middleware runs, so it
would serve protected images to anyone. The site uses plain `<img>`
throughout, so the endpoint is refused in the middleware and, in
production, by `worker.mjs`, a small wrapper around OpenNext's worker that
`wrangler.jsonc` points at. The middleware matcher also runs on every path,
`_next` included, since excluding `/_next/static` let a traversal skip the
gate.

### Study facts in a TypeScript file, stories in MDX
`src/content/studies.ts` holds each study's facts; the MDX file holds the
story. Considered: frontmatter in each MDX file. Chosen because the facts are
needed in places MDX cannot reach cheaply: the middleware, the sitemap, the
unlock pages and `llms.txt`. `npm run check` fails if the two fall out of
step. MDX files are found by slug, so adding a study needs no code change.

### Generated, not hand-maintained, files for machines
`llms.txt`, `robots.txt` and `sitemap.xml` are generated from the same data
as the pages, so an AI reviewer or search engine can never be told something
the site contradicts.

### The CV is generated from data
The CV is a page (`/cv`) printed to a PDF by `npm run cv`, from
`src/content/cv.ts`. It uses real text and real bullet characters so CV
parsing software reads it correctly, and it refuses to exceed two pages.

### Two Workers, not preview URLs
Staging and production are two separate Workers built from the `staging` and
`main` branches. Staging has a stable address that can be shared and
bookmarked, and can never claim the production domain.

### A deliberately plain starting skin
The template ships with system fonts and neutral greys so that nothing about
it reads as someone else's design. `setup-portfolio` replaces it.

### The access cookie expires on the server, and follows the passphrase
The cookie carries its signed issue time and the server refuses it after 24
hours; the browser's own expiry is only a courtesy, since a copied cookie
ignores it. It is signed with a key made from `SESSION_SECRET` and the
passphrase, so changing the passphrase signs everyone out. Considered: a
list of revoked cookies. Chosen because it needs no storage and the
passphrase is already the thing you change when access should end.

### Study data never enters a browser component
Anything a `'use client'` file imports is compiled into public JavaScript
under `/_next/static`, which Cloudflare serves before the passphrase can
be checked. So only server components read study data, and pass plain
strings down. Found by the third security review; enforced by
`npm run check:security`.

### Independent review by fresh agents
Tests and security reviews are done by agents that did not write the code,
dispatched fresh each time. A reviewer that remembers writing the code, or
remembers its last review, tends to confirm rather than check.
