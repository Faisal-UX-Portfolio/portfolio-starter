# Going live

## Release status

**Not yet live.** Setup has not reached step 8. The `setup-portfolio` skill
updates this block as the launch progresses.

<!--
Record here, newest first: what is live, where, and anything the owner
should know. For example:
- Staging: <name>-portfolio-staging, https://...workers.dev
- Production: <name>-portfolio, https://...workers.dev (custom domain: none)
- Secrets set on both Workers: PORTFOLIO_PASSWORD, SESSION_SECRET
-->

---

## The shape of it

| | Branch | Worker | Address |
|---|---|---|---|
| Staging | `staging` | the `env.staging.name` in `wrangler.jsonc` | a free `*.workers.dev` address |
| Production | `main` | the top-level `name` in `wrangler.jsonc` | a free `*.workers.dev` address, or your own domain |

Cloudflare watches the GitHub repository and builds whichever branch was
pushed. A failed build never breaks the live site; it simply does not
publish.

## Setting it up

The `setup-portfolio` skill (step 8) walks through this with you. For
reference:

1. **GitHub.** A free account, and a **private** repository holding this
   project, with `staging` and `main` branches.
2. **Cloudflare.** A free account. Two Workers created from the repository
   (Workers & Pages, Create, import a Git repository):

   | Setting | Staging | Production |
   |---|---|---|
   | Project name | must match `env.staging.name` | must match the top-level `name` |
   | Production branch | `staging` | `main` |
   | Build command | `npm run build:cf` | `npm run build:cf` |
   | Deploy command | `npx wrangler deploy --env staging` | `npx wrangler deploy` |

   The project names must match `wrangler.jsonc` exactly, or builds fail.
3. **Secrets, on both Workers** (Settings, Variables and Secrets, type
   Secret): `PORTFOLIO_PASSWORD` and `SESSION_SECRET`. A secret added after
   a build is only picked up by the **next** build, so trigger one more.
4. **Analytics (optional).** `NEXT_PUBLIC_GA_ID` as a build variable on the
   production Worker.

## Everyday updates

1. Ask for a change; it lands on `staging` and appears at the staging
   address.
2. Look at it there, on your laptop and phone.
3. Say "ship it". The `ship` skill checks everything, has it tested and
   reviewed, then merges into `main`, and the live site rebuilds.

## A custom domain (optional)

1. Buy a domain through Cloudflare, or add one you own to your Cloudflare
   account.
2. Uncomment the `routes` block in `wrangler.jsonc` with your domain in it.
   **From then on it must stay.** A deploy without the route in the config
   can silently detach the domain from the Worker.
3. Set `site.url` in `src/content/site.ts` to the new address, and ship it.
4. Add a rate limiting rule for `/api/unlock` on the domain (Security, WAF,
   Rate limiting rules; the free plan includes one). It backs up the limit
   built into the site, which only counts attempts per server instance.
5. In Google Search Console, add the domain and submit `sitemap.xml`.

The staging Worker keeps its `workers.dev` address and can never claim the
domain: its `routes` are explicitly empty.

## Rollback

In the Cloudflare dashboard, open the production Worker's Deployments and
restore the previous version. It takes effect in seconds. Then fix the
problem on `staging` and ship again. If something private is showing, say
"Lockdown" first and debug second.

## Publishing without GitHub (emergencies only)

If GitHub or the build pipeline is down:

```bash
npx wrangler login        # first time only
npm run deploy:staging    # publish to staging
npm run deploy            # publish to production
```

Commit and push the same change afterwards, so the next Git build does not
overwrite it with older code.

## If something looks wrong

- **A build fails:** open its log in the Cloudflare dashboard and paste the
  error into a Claude session.
- **The passphrase is rejected right after setting secrets:** trigger one
  more build.
- **The live site misbehaves:** roll back first, debug second. Never
  troubleshoot on the live site.
- **Never share** `.env.local` or the session secret. The passphrase is the
  only secret meant for other people.
