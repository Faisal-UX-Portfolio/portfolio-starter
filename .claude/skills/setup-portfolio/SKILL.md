---
name: setup-portfolio
description: Guided first-time setup that turns this template into the owner's own portfolio. Checks prerequisites, installs useful skills, interviews them about themselves, reviews a moodboard of sites they like, designs the home and case study pages with up to two rounds of feedback, builds the front end, shows where their content goes, deploys through GitHub and Cloudflare, and creates a walkthrough of how the site works. Run when the user says "set up my portfolio", "/setup-portfolio", "start setup", "continue setup", or opens this project when .portfolio-setup.json is missing or its phase is below 10. Resumable across sessions.
---

# Set up my portfolio

This template is a finished portfolio engine with a deliberately plain skin:
case studies written in MDX, image handling, a passphrase for protected
studies and for the whole site, CV and certifications pages, generated PDFs
and social images, automated checks, and deployment to Cloudflare. What it
does not have is a design. This skill gives it the owner's.

## Who you are talking to

A designer, probably not a developer, using the Claude Code desktop app.

- **Plain language.** Explain any technical word the first time you use it,
  in one short clause. Never paste a wall of commands.
- **One thing at a time.** One question per message in every interview, and
  wait for the answer. Use AskUserQuestion when there are sensible options
  to choose from; ask in plain text when the answer is theirs to write.
- **You run the commands.** Use Bash yourself for anything that does not
  need their account, password or approval in a browser. When they must run
  something (a login, a slash command), give exactly one command in its own
  `bash` block, say what it will do, and wait.
- **Show, don't describe.** Use the Browser pane (`preview_start` with the
  `portfolio` configuration) to show them the site as it changes.
- **Say where you are.** Start each phase with "Step N of 9: <name>" and one
  sentence on what it involves.

## Ground rules

- **Never type a password, token or payment detail for them, never create
  an account for them, and never print the values in `.env.local`.** Where
  they need a secret, put it where they can see it (open the file, or copy
  it to their clipboard) without it passing through the chat.
- **Facts come from them.** Never invent a metric, date, employer, client or
  quote. Quotes are verbatim.
- **The engine is not yours to redesign.** See the list in phase 6.
- Work on the `staging` branch. Commit at the end of every phase with a
  message saying what the phase did. Nothing is pushed before phase 8.
- **Independent review.** At the end of phases 6 and 8, dispatch the
  `site-tester` and `security-reviewer` agents in one message so they run in
  parallel. Fix what they find, then dispatch **fresh** agents again (never
  continue the old ones) until both come back clean. High-severity security
  findings block deployment.

## Progress file

`.portfolio-setup.json` at the repository root records where setup is, so
a new session can pick up exactly where the last one stopped. Read it
first. If it does not exist, start at phase 1. Update it at the end of every
phase and commit it with that phase's work.

```json
{
  "phase": 1,
  "designTool": null,
  "designUrl": null,
  "feedbackRounds": 0,
  "workerNames": null,
  "stagingUrl": null,
  "productionUrl": null,
  "walkthroughUrl": null
}
```

`phase` is the next phase to run; 10 means setup is finished. When
resuming, say which step you are picking up from and recap the last one in
a sentence.

---

## Step 1 of 9: Welcome and your computer

Explain the journey in a short list: about you, your moodboard, two
designs, the build, your content, going live, and a guide to how it all
works. It takes a few sessions; they can stop at any point and say
"continue setup" later.

Then check the machine, one item at a time, fixing each before the next:

1. **Node.js 22.18 or newer**: `node -v`. If missing or older, they install
   the LTS version from https://nodejs.org themselves (a normal Mac
   installer), then tell you when it is done.
2. **Git**: `git --version`. On a Mac, if it is missing, macOS offers to
   install the developer tools; they accept that prompt.
3. **Google Chrome**: check `/Applications/Google Chrome.app` exists. The
   scripts that make the CV PDF, the social image and the automated tests
   drive Chrome. If it is missing, they install it from google.com/chrome.
4. **Packages**: run `npm install` yourself.

**Their own history.** If `git log` shows the template's commits, offer to
start a fresh history so the repository is theirs from the first commit.
With their agreement: ask for the name and email they want on their
commits (their GitHub noreply address is fine later), then

```bash
rm -rf .git && git init -b staging
git config user.name "<name>" && git config user.email "<email>"
git add -A && git commit -m "Start my portfolio from the template"
```

**Their passphrase.** Run `node scripts/new-env.mjs`. It creates
`.env.local` with a four-word passphrase and a session secret and prints
neither. Explain: the passphrase is what they give recruiters to open
protected case studies; it is also the key to the emergency lockdown. Open
the file for them to see it (`open -e .env.local`) and tell them to keep a
copy in their password manager. Never read it out yourself.

**First look.** Start the dev server with `preview_start` (configuration
`portfolio`) and show them the home page, then the demo case study
(Harbourline Ferries, which is protected, so they get to try their
passphrase). Explain: everything they see is placeholder, and the plainness
is deliberate; step 4 onwards replaces it with their design.

Record `"phase": 2` and commit.

## Step 2 of 9: Useful skills

Skills are add-ons that make Claude better at particular jobs. Four are
worth having. Explain each in a sentence, then install one at a time.

1. **Ponytail**: keeps the code simple and stops it growing bloated. It is
   a plugin, installed with two slash commands **they** type, as two
   separate messages:
   ```
   /plugin marketplace add DietrichGebert/ponytail
   ```
   ```
   /plugin install ponytail@ponytail
   ```
   (In the desktop app they can also use the + button by the prompt box,
   then Plugins, then Add plugin.)
2. **Impeccable**: a design quality toolkit (audit, polish, typography,
   colour, layout). Also a plugin: they type
   `/plugin marketplace add pbakaus/impeccable`, then open `/plugin`,
   choose Discover, and install Impeccable.
3. **Apple design**: reviews interfaces against Apple's Human Interface
   Guidelines. With their agreement, run it yourself:
   `npx skills add dickwu/apple-design-skill` (or, if that fails,
   `git clone https://github.com/dickwu/apple-design-skill.git ~/.claude/skills/apple-design`).
4. **Lockdown**: already included in this project. Explain it: saying
   "Lockdown" puts the whole live site behind the passphrase within minutes,
   and "Reopen" lifts it. It is for when something goes wrong.

Newly installed skills appear in a new session. Tell them: if you cannot
see a skill later, start a new session and say "continue setup".

Record `"phase": 3` and commit.

## Step 3 of 9: About you

Fill `src/content/site.ts` and `src/content/cv.ts`. One question at a time:

1. Their name as it should appear on the site.
2. Their role or title.
3. Where they are based (city and country).
4. The email address visitors should use. Remind them it will be public.
5. Their LinkedIn profile URL.
6. **House style.** UK or US spelling? Any writing rules they care about
   (for example, no em dashes)? Record the answer in the "House style"
   section of `CLAUDE.md`, and follow it from now on.
7. **Their CV.** Ask them to drag their current CV (PDF or Word) into the
   chat. Read it and fill `cv.ts`: summary, roles (newest first, with
   bullets exactly as written unless they ask you to tighten them),
   certifications and skills. Confirm every role and date back to them. If
   they have no CV to hand, interview them role by role instead.
8. **Tagline and bio.** From what you now know, draft three tagline options
   (one sentence each) and a two-paragraph bio. Let them pick and edit.
   Their words win.
9. **Testimonials** (optional). Only verbatim quotes, with the person's name
   and role. LinkedIn recommendations are a good source. Never tidy the
   wording.
10. **Phone** (optional): if they want it on the CV PDF, it goes in
    `CV_PHONE` in `.env.local`, which never reaches the live site. Ask them
    to add it to the file themselves.

Leave `site.url` for step 8. Show them the updated pages in the browser.
Record `"phase": 4` and commit.

## Step 4 of 9: Your moodboard

This is the heart of the design. Take your time.

1. Ask them to gather 5 to 15 screenshots of websites they like the look
   of, into one folder, then drag the folder into the chat or paste its
   path (in Finder: right-click the folder, hold Option, choose "Copy as
   Pathname"). Portfolios, but also any site whose feel they like.
2. List the folder and **Read every image**. If there are more than 15, ask
   which to prioritise.
3. **Go through the images one at a time.** For each one:
   - Describe what you see in concrete design terms, in two or three lines:
     layout and grid, typography, colour, density and white space, imagery,
     any hint of motion or interaction.
   - Ask **one** question: "What drew you to this one?" Wait.
   - Then ask **one** follow-up: "Is there anything here you would not
     want on your site?" Wait.
   - Note their answers against the image before moving on.
4. **Then the cross-cutting questions, one at a time.** Offer options with
   AskUserQuestion wherever you can, drawn from the images:
   - Three words for how the site should feel.
   - Typography: serif, sans-serif, or a pairing? Quiet or characterful?
   - Colour: restrained and neutral, one bold accent, or a colour per case
     study? (The engine supports per-study colours.)
   - Density: generous white space or information-rich?
   - Imagery: big visuals up front, or text-led?
   - Motion: none, subtle, or expressive?
   - Case studies: long-form reading, or skimmable sections with a
     summary up top?
   - What should a hiring manager remember after thirty seconds?
   - Anything absolutely off limits?
5. **Write `docs/DESIGN-BRIEF.md`**: design principles (three to five), a
   table of the references (image file, what they like, what they would
   avoid), then direction for typography, colour, layout, imagery, motion
   and the case study reading experience, and a list of things to avoid.
   End with the non-negotiables that come with the engine: WCAG AA contrast
   in light and dark, visible focus, 44px touch targets, respects reduced
   motion, no sideways scrolling at 375px or at 200% text size.
6. Show them the brief. Revise until they say it describes what they want.

Do not copy their moodboard images into the repository: they are other
people's work, and the repository may become public. The brief records the
file names only.

Record `"phase": 5` and commit.

## Step 5 of 9: Two designs

Design two pages: **the home page** and **a case study page**, in the light
appearance, at desktop width. Use real content, not lorem ipsum: their name,
role and tagline from `site.ts`, the demo studies from
`src/content/studies.ts`, and the Harbourline Ferries narrative from its MDX
file.

The case study design must show every building block the engine renders,
so none of them is left undesigned: the facts header (client, title,
summary, role, timeline, industry), the outcome, the deliverables, the
endorsement, the cover image, body text with headings, a list, a table, an
image with its caption, a quote, a highlighted metric, a decision log, the
zoomable artefact viewer, the chapter navigation, and the next study link.
The home page must show the navigation with the light/dark control, the
introduction, the study cards (including a protected study's locked card),
and the footer.

**Which tool.** Check your available skills for one named `design` (Claude
Design). If it is there, invoke it to create one canvas with the two
artboards, following the brief. If it is not, build the two pages as
self-contained HTML mockups and publish each as an Artifact (load the
`artifact-design` skill first if you have it). Record which tool you used in
`designTool` and the link in `designUrl`.

**Feedback: up to two rounds.** Share the link and ask what they think.
Apply each round of feedback to the same design and republish it to the
same link. Count the rounds in `feedbackRounds`. After the second round,
ask for approval, and explain that anything else they want changed is
easier to adjust on the real site in the next step. When they approve,
record the approved link at the top of `docs/DESIGN-BRIEF.md`.

Record `"phase": 6` and commit.

## Step 6 of 9: Build it

Rebuild the front end to match the approved designs, on top of the engine.

**Yours to change:** everything in `src/app/globals.css` (token values,
fonts, styles), `tailwind.config.ts`, every component in `src/components/`,
and the layout and styling of every page in `src/app/`. Fonts go in through
`next/font/google` (it self-hosts them, so the security policy needs no
change). Motion libraries are fine if the brief calls for motion, as long as
every animation respects reduced motion and the page works if it never runs.

**Not yours to change** (the engine; the security checks watch several of
these): `src/middleware.ts`, `src/lib/` (cookie-auth, paths,
protected-routes, lockdown, case-studies, json-ld), `src/app/api/unlock/`,
the security headers in `next.config.mjs`, `wrangler.jsonc`, `scripts/`,
`tests/`, and the shape of the data in `src/content/`. Each page must keep
its data sources, metadata, structured data and accessibility.

**The token contract.** Keep the token names components rely on (`paper`,
`paper-raised`, `paper-sunken`, `ink`, `ink-soft`, `ink-faint`, `line`,
`accent`, `accent-ink`, `accent-wash`); change their values freely and add
new ones. Keep `--paper` and `--paper-raised` in the form
`light-dark(#light, #dark)`: the contrast check reads them. Colours live
only in `globals.css`, `tailwind.config.ts` and the study colours in
`src/content/studies.ts`, never as raw hex in `src/app` or `src/components`.
Change the demo studies' colours to suit the brief if you like; the content
check verifies their contrast.

**Order of work**, checking each in the Browser pane at 375, 768 and 1440
wide, in light and dark, against the approved design:

1. Tokens and fonts
2. Navigation and footer
3. Home page and study cards
4. Case study page: the frame, the MDX body styles, then the metric,
   decision log and artefact viewer
5. Unlock screens (study and site-wide)
6. Work, About and Certifications pages, and the 404 page
7. The one-pager, the social image (`/og`) and the LinkedIn banner
   (`/banner`)

The CV (`/cv`) is a printed document built to survive CV-reading software;
restyle it only lightly.

**Polish.** If the Impeccable skills are available, run its audit and
polish passes; if the apple-design skill is available, run a review with
it. Fix what they find that fits the brief.

**Generate and check.** With the dev server running:

```bash
npm run og && npm run cv && npm run onepagers
npm run check
```

Then dispatch `site-tester` and `security-reviewer` in parallel (first
review: tell the security reviewer to review the whole repository). Fix,
re-run, re-dispatch fresh agents until both are clean.

Walk them through the finished site in the browser. Adjust until they are
happy. Record `"phase": 7` and commit.

## Step 7 of 9: Your content

Show them where everything lives:

| What | Where |
|---|---|
| Name, role, bio, links, testimonials | `src/content/site.ts` |
| CV and certifications | `src/content/cv.ts` (then `npm run cv`) |
| The list of case studies and their facts | `src/content/studies.ts` |
| Each case study's story | `src/content/case-studies/<slug>.mdx` |
| Each case study's images | `public/case-studies/<slug>/` |
| The passphrase | `.env.local` here, and in Cloudflare for the live site |
| Which studies are protected | `protected: true` in `studies.ts` |

Explain the building blocks they can use in a study, with a one-line
example each: headings, images (the alt text doubles as the caption), a
highlighted metric (`<Metric note="how it was measured">25%</Metric>`), a
decision log, and the zoomable artefact viewer for confidential work.

Offer to add their first real case study now with the `new-case-study`
skill. Explain that the demo studies must be deleted before the site goes
live (the strict check enforces it), and that `new-case-study` offers to do
that once their first study is in.

Record `"phase": 8` and commit.

## Step 8 of 9: Going live

Two free accounts, two copies of the site: **staging**, a private preview
where every change appears first, and **production**, the live site. Both
get free `*.workers.dev` addresses. A custom domain is optional and comes at
the end.

### 8.1 GitHub

1. If they have no GitHub account, they create one at
   https://github.com/signup (you cannot do this for them).
2. Check `gh --version`. If the GitHub command-line tool is missing: if
   `brew --version` works, run `brew install gh` with their agreement;
   otherwise they download the installer from https://cli.github.com.
3. They sign in, in the Terminal panel (it opens a browser to approve):
   ```bash
   gh auth login --web --git-protocol https
   ```
   Then run `gh auth setup-git` yourself.
4. **Create their repository, private.** Private matters: the full text of
   a protected case study lives in the repository, so a public repository
   would publish it. Ask what to call it, then:
   ```bash
   gh repo create <name> --private --source=. --remote=origin
   git push -u origin staging
   git push origin staging:main
   ```

### 8.2 Name the two Workers

Workers are Cloudflare's name for the two copies of the site; their names
become part of the addresses. Suggest `<firstname>-portfolio` and
`<firstname>-portfolio-staging`, and set them in `wrangler.jsonc` (the
top-level `name`, and `env.staging.name`). Record them in `workerNames`,
commit and push to `staging`.

### 8.3 Cloudflare

1. They create a free account at https://dash.cloudflare.com/sign-up and
   verify their email.
2. **Staging Worker.** In the dashboard: Workers & Pages, Create, then
   import a Git repository. They connect GitHub (approve access for this
   repository only) and pick the repository. Settings:

   | Setting | Value |
   |---|---|
   | Project name | the staging name from 8.2 |
   | Production branch | `staging` |
   | Build command | `npm run build:cf` |
   | Deploy command | `npx wrangler deploy --env staging` |

3. **Production Worker.** The same again, with the production name, branch
   `main`, and deploy command `npx wrangler deploy`.
4. **Secrets, on both Workers.** Settings, then Variables and Secrets, then
   add each as a **Secret**:
   - `PORTFOLIO_PASSWORD`: the same passphrase as in `.env.local`. Open the
     file for them (`open -e .env.local`) to copy it.
   - `SESSION_SECRET`: a new one per Worker. Copy one to their clipboard
     without it appearing anywhere:
     `openssl rand -hex 32 | tr -d '\n' | pbcopy`, and they paste it.
   - Optional analytics: `NEXT_PUBLIC_GA_ID` goes on the production Worker
     as a **build variable** (Settings, then Build), not a secret.

   Cloudflare only picks up secrets on the next build, so once they are in,
   trigger a build of each (the Retry build button, or an empty commit).
5. They tell you when each build finishes, or share a screenshot of any
   error. Get both addresses (Settings, then Domains and Routes), and record
   them as `stagingUrl` and `productionUrl`.

The dashboard's wording changes from time to time. If what they see does not
match these steps, ask for a screenshot and guide them from it.

### 8.4 Check staging

1. Set `site.url` in `src/content/site.ts` to the production address,
   commit and push to `staging`, and wait for the staging build.
2. Delete the demo studies if they have not already (they must be gone
   before production), regenerate with `npm run og && npm run cv &&
   npm run onepagers`, and run the strict check against staging:
   ```bash
   npm run check -- --strict --url <stagingUrl>
   ```
3. Dispatch `site-tester` (with the staging URL) and `security-reviewer`
   (reviewing `git diff` since the phase 6 review, plus `wrangler.jsonc`)
   in parallel. Fix, push, re-dispatch fresh until both are clean.
4. They review staging on their laptop and phone.

### 8.5 Go live

When they are happy, run the `ship` skill: it merges `staging` into `main`,
waits for the production build, and tests the live site.

### 8.6 A custom domain (optional)

If they want their own domain, they can buy one through Cloudflare
(Domain Registration) or add one they already own. Then:

1. Uncomment the `routes` block in `wrangler.jsonc` and put their domain in
   it. From then on it must never be removed (see GO-LIVE.md).
2. Set `site.url` to the new address.
3. Ship it. Then, in the Cloudflare dashboard for the domain, add a rate
   limiting rule for `/api/unlock` (Security, then WAF, then Rate limiting
   rules; the free plan includes one), to back up the limit built into the
   site.

Update the "Release status" block at the top of `GO-LIVE.md`. Record
`"phase": 9` and commit.

## Step 9 of 9: How your site works

Create the walkthrough: one page that explains their site in plain English,
for them and for anyone they hand the project to.

1. Write `docs/walkthrough/walkthrough.html` (load the `artifact-design`
   skill first if you have it). Cover: the shape of it (GitHub, the two
   Workers, their addresses), where each kind of content lives, what
   happens when someone opens a page (including the passphrase), how a
   change gets to the live site, the skills and what each one is for, the
   automated checks and the two reviewer agents, and a cheat sheet of the
   things they will say most ("add a case study", "ship it", "Lockdown").
   Use `<pre class="mermaid">` diagrams for the flows. Every fact comes from
   the code in this repository; cite nothing from memory.
2. Publish it as an Artifact and record the link in `walkthroughUrl` and in
   `docs/walkthrough/README.md`.
3. Explain `walkthrough-sync`: a check that runs after changes and keeps the
   walkthrough honest as the site evolves.

Record `"phase": 10` and commit. Push to `staging`.

## Finish

Congratulate them, briefly. Then the three things to remember:

- Ask for any change in plain English; it appears on staging first.
- Say **"ship it"** to put what is on staging live.
- Say **"Lockdown"** if anything ever goes wrong, and **"Reopen"** after.
