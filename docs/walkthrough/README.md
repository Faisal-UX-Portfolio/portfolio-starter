# The walkthrough

`walkthrough.html` is the source of a published Claude artifact explaining
how this site works, in plain English. Step 9 of the `setup-portfolio` skill
creates it. It is published, not deployed: no route on the site serves it.

- **Published at:** (set by setup step 9)
- **Kept in step by:** the `walkthrough-sync` skill
- **Watched by:** `.claude/hooks/walkthrough-drift.sh`, which says nothing
  unless a watched file has changed since the page was last committed

The file here is the source of truth. Update it and republish to the same
URL; never rewrite it from scratch, and always read the live version before
publishing, because it can be edited from elsewhere.

## What the page says, and where it comes from

When a file on the left changes, re-check what the page says about it.

| Source | What the walkthrough says about it |
|---|---|
| `src/content/studies.ts` | how many studies there are and how many are protected |
| `src/middleware.ts`, `src/lib/` | what happens on a request, the passphrase, the lockdown |
| `src/app/api/unlock/` | how unlocking works and its limits |
| `src/app/sitemap.ts`, `robots.ts`, `llms.txt/` | what search engines and AI tools see |
| `wrangler.jsonc`, `package.json`, `next.config.mjs` | the two Workers, the build, the security headers |
| `scripts/` | the checks and generated files |
| `.claude/skills/`, `.claude/agents/` | the skills and reviewer agents |
