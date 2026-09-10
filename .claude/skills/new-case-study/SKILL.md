---
name: new-case-study
description: Add a case study to the portfolio, or rework an existing one. Run when the owner says "new case study", "/new-case-study", "add a case study", "add a project", or shares material about a piece of work they want on the site. Interviews them one question at a time, files their images, writes the study from their own material, checks it, and shows it on the dev server. Commits to staging; never ships on its own.
---

# New case study

A case study is three things, and `npm run check` fails if any is missing:

1. An entry in `src/content/studies.ts` (the facts: title, client, role,
   outcome, colour, whether it is protected)
2. The story in `src/content/case-studies/<slug>.mdx`
3. Its images in `public/case-studies/<slug>/`

## Ground rules

- **Facts come from the owner.** Never invent a number, date, client name or
  outcome. If a metric has no source, ask for one or leave it out.
- **Quotes are verbatim**, with the person's name and role.
- **Their words first.** Structure and tighten what they give you; do not
  replace their voice with yours. Follow the house style in `CLAUDE.md`.
- One question at a time.
- Work on `staging`. Commit when they approve. Never push to `main`; that is
  what "ship it" is for.

## 1. Preflight

```bash
git branch --show-current && git status --short && git pull
```

## 2. The material

Ask them to share whatever they have: an old write-up, a deck exported as
PDF, notes, or just a conversation. Read all of it before asking anything.

## 3. Interview

Ask only for what the material does not already answer, one at a time:

1. **Can the client be named?** If not (an NDA, or they would rather not),
   agree an anonymised description ("A UK high-street bank").
2. **Should it be protected?** Protected studies sit behind the passphrase:
   the page, its one-pager and its images. Good for NDA work and anything
   unreleased. Remind them the story's text still lives in their GitHub
   repository, which must therefore stay private.
3. Title (a short outcome-led headline works well), their role, the
   timeline, the industry.
4. A two or three sentence summary.
5. **The outcome**, in one line, with real numbers if they have them, and
   how each number was measured.
6. What they delivered (four or five items).
7. An endorsement, if they have one: verbatim.
8. Should it appear on the home page (`featured`)?

## 4. Images

Ask them to put the study's images in one folder and drag it into the chat.

- Choose a slug with them: lowercase words joined by hyphens, which becomes
  the address (`/case-studies/<slug>`).
- Copy the images to `public/case-studies/<slug>/` with short, lowercase,
  hyphenated names. Pick a cover.
- Run `npm run images` to compress them without resizing.
- **Alt text for every image.** Look at each one, draft a description of
  what it shows and why it matters, and confirm with them. In MDX the alt
  text is also the visible caption.
- Screenshots of confidential work belong in the `ArtifactViewer`, which
  discourages casual saving. It is not real protection: anything shown in a
  browser can be captured. Truly confidential work belongs in a protected
  study, or not on the site.

## 5. Colour

Each study has its own accent. Propose one that fits both the design brief
(`docs/DESIGN-BRIEF.md`) and the client's world, with its five forms: the
vibrant `accent`, a darker `ink` for text on light backgrounds, a lighter
`glow` for text on dark ones, a pale `wash`, and a translucent `washDark`.
`npm run check` measures the contrast of every pairing in both appearances
and tells you which fail; adjust until it passes.

## 6. Write it

Add the entry to `src/content/studies.ts` and write the MDX. A shape that
works, to adapt rather than impose: Overview, The problem, Research, Design
(the key decisions), Outcome, Reflection. Use their material.

The building blocks, used where the material supports them:

- `<Metric note="how it was measured">25%</Metric>` for a number that
  matters. The note is required: it is what makes the number credible.
- `<DecisionLog title="..." chose="..." rejected="..." because="..." />` for
  a real decision with a real trade-off.
- `<ArtifactViewer src="/case-studies/<slug>/file.png" title="..." />` for a
  detailed artefact people will want to zoom into.
- `![what the image shows](/case-studies/<slug>/file.png)` for everything
  else.
- Tables and quotes in plain markdown.

Import the components at the top of the MDX file, as the demo studies do.

## 7. Check and show

With the dev server running:

```bash
npm run check
npm run onepagers    # for a public study
```

Open the study in the Browser pane at desktop and phone widths, light and
dark, and walk them through it. Revise until they are happy.

## 8. The demo studies

If Harbourline Ferries or Meadowbank Libraries are still there, offer to
delete them now: their entries in `studies.ts`, their MDX files and their
image folders. They must be gone before the site goes live.

## 9. Commit

```bash
git add -A && git commit -m "Add the <title> case study"
```

Tell them it is on `staging` once pushed, and that "ship it" puts it live.
Run `walkthrough-sync` if the walkthrough exists.
