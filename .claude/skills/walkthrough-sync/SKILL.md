---
name: walkthrough-sync
description: Check the published walkthrough artifact against the repository and bring it back into step. Run when the owner says "walkthrough-sync", "/walkthrough-sync", "is the walkthrough still right?", "update the walkthrough", or at the end of any change that alters how the site works. Dispatches one read-only subagent to audit the page against the source, applies only what it confirms, and republishes to the same artifact URL. Never pushes and never rewrites the page from scratch.
---

# Keep the walkthrough honest

The walkthrough artifact explains how this site works. It is a document
about the code, so the code changing is exactly what makes it wrong, and a
walkthrough nobody can trust is worse than none.

`docs/walkthrough/README.md` holds the artifact URL and the table of which
files the page makes claims about. **Read it first.** If there is no
walkthrough yet (no `walkthrough.html`), say so and suggest finishing step 9
of `setup-portfolio`, then stop.

## 1. What changed

```bash
git branch --show-current && git status --short && git pull
synced=$(git log -1 --format=%H -- docs/walkthrough/walkthrough.html)
git diff --name-only $synced..HEAD
```

Uncommitted changes count too. Intersect the list with the README's watch
table. **If nothing watched has changed, say so in one line and stop.** That
is the usual outcome.

## 2. Read the live artifact first

Read it with the Artifact tool (`action: "read"`, the URL from the README).
If it differs from `docs/walkthrough/walkthrough.html`, the live version
wins: copy it into the repository file first and say that you did.
Publishing over a newer version without reading it is the one mistake here
that cannot be undone.

## 3. Audit with a fresh reader

Dispatch **one** subagent (general-purpose), read-only. Give it: the changed
watched files and their diffs, the matching rows of the watch table, and the
path to `walkthrough.html`. Ask it to check the prose and the diagram labels
against the source, and to report each finding as: the exact claim quoted,
where it is, what the source says now (with `file:line`), and the exact
replacement wording. It must not edit anything, and should say plainly when
a change makes no difference to the page.

## 4. Apply what it confirms

Check each citation yourself before you write it in. Keep the plain-English
tone of the page. Diagrams are `<pre class="mermaid">` blocks: edit them in
place.

## 5. Publish, record, stop

Publish `docs/walkthrough/walkthrough.html` with `url` set to the artifact
URL, so it updates in place. Then commit; the commit is what records the
sync:

```bash
git add docs/walkthrough && git commit -m "Sync the walkthrough with <what changed>"
```

Never push and never deploy: this changes a document about the site, not
the site. Tell the owner what changed, in a sentence or two.
