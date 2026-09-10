# Security

What this site protects, how, and where the limits are. Written for the
owner and for the `security-reviewer` agent, which reads it before every
review.

## What the passphrase is for

The passphrase keeps confidential case studies away from casual visitors,
search engines and AI crawlers, while letting you share them with the people
you choose by sending four words. The lockdown extends the same screen over
the whole site when something needs to come down quickly.

It is a **shared courtesy gate**, not an account system. It is strong
against guessing and against tampering, and it is not designed to stop
someone you gave the passphrase to from passing it on.

## What is protected

| Asset | How |
|---|---|
| A protected study's page, one-pager and images | Middleware redirects to its unlock page without a valid cookie. Images are covered because they live in `public/case-studies/<slug>/`, which Cloudflare routes through the Worker. |
| Everything, while locked | The same middleware redirects every path except `/unlock`, `/api/unlock`, `/robots.txt` and `/sitemap.xml`. Files under `/case-studies/`, `/documents/` and `/one-pagers/` are covered too. |
| The passphrase | Only ever compared as a keyed hash, so response timing reveals nothing. Five attempts per address per ten minutes, and a half-second delay after each wrong one. |
| The access cookie | Signed with `SESSION_SECRET`; any change to it, including adding another study to it, breaks the signature. HttpOnly (page scripts cannot read it), Secure on HTTPS, SameSite=Lax, lasts 24 hours. |
| Your secrets | `.env.local` locally (gitignored, readable only by you) and Cloudflare secrets in production. Never in the repository; the security check fails if one appears. |
| Visitors | A strict Content-Security-Policy, no framing, no content sniffing, HTTPS enforced. No analytics cookie before consent. |

## What is not protected, by design

- **The passphrase is shared.** Anyone who has it can pass it on. If that
  matters, change it (below).
- **There is no sign-out.** An unlocked browser stays unlocked for 24 hours.
- **The rate limit counts per server instance**, and Cloudflare runs many,
  so a determined attacker spread across many instances gets more than five
  guesses. The four-word passphrase is still billions of combinations. With
  a custom domain, add Cloudflare's rate limiting rule on `/api/unlock` as a
  second layer (see GO-LIVE.md).
- **Your GitHub repository holds every study's full text.** That is why it
  must stay **private** while any study is protected.
- **Anything shown in a browser can be captured.** The artefact viewer
  discourages casual saving; it does not prevent screenshots.
- **Files under `public/` outside the three covered prefixes are public**,
  even while locked: the favicon and the share image. Anything private goes
  under `/documents/` or a study's folder.
- **The titles of protected studies are public**: they appear on the home
  page cards and in `llms.txt`, so visitors know the work exists. Their
  content, covers and outcomes do not.

## If something goes wrong

| What happened | Do this |
|---|---|
| Something private is visible | Say "Lockdown". Investigate afterwards. |
| The passphrase leaked further than you wanted | Change `PORTFOLIO_PASSWORD` in `.env.local` and as a secret on **both** Workers, then trigger a build of each (secrets are picked up on the next build). Tell the people who should still have it. |
| `SESSION_SECRET` leaked | Generate a new one for each Worker and rebuild. Every existing unlock stops working, which is the point. |
| A secret was committed to GitHub | Change it immediately as above: deleting the commit is not enough, because it may already have been copied. Then remove it from the repository. |
| A dependency has a vulnerability | `npm audit fix`, run `npm run check`, ship it. |

## Reviews

The `security-reviewer` agent reviews every change before it ships, and
records nothing here itself. Significant reviews (the first review, anything
that found a High issue) are summarised below by the session that fixed
them.

| Date | Scope | Result |
|---|---|---|
