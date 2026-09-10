---
name: new-role
description: Update the whole portfolio for a new job, including the CV. Run when the owner says "new-role", "/new-role", "I've got a new job", "I'm starting at [company]", or asks to change their title or employer. Confirms the facts, updates site.ts and cv.ts, regenerates the CV, social image and banner, checks, and stops for approval. Never ships on its own.
---

# New role

Everything that states the owner's role reads from two files:
`src/content/site.ts` (role, tagline, bio) and `src/content/cv.ts` (the
roles list). Update those and the site follows. Then regenerate the files
that bake the role into an image or PDF.

## Ground rules

- **Ask first: have they actually accepted, and is it public?** Announcing a
  job on a portfolio before the contract is signed, or before the current
  employer knows, can cause real trouble. If the answer is not a clear yes,
  stop and offer to prepare the change on a branch without shipping it.
- Facts come from them: the exact title, employer name, start month, and
  what the role involves. If they have the job description, read it.
- No edit before they approve the plan.
- The CV PDF gets its own approval.
- Commit to `staging`; never push to `main`.

## 1. Preflight

```bash
git branch --show-current && git status --short && git pull
```

## 2. Interview, one question at a time

1. Have they accepted, and can it be public now?
2. Exact job title, and the employer as it names itself.
3. Start month. Does the previous role end the month before?
4. One sentence about the employer, and two or three bullets about the role
   (draft from the job description if they share it; they approve the
   wording).
5. Does their headline role in `site.ts` change? Does the tagline or bio
   need to follow?

## 3. Plan, then wait

Show: the new `cv.roles` entry (added at the top), the end date on the
previous role, and any changes to `site.ts`. Wait for approval.

## 4. Edit, regenerate, check

1. Edit `src/content/cv.ts` and `src/content/site.ts`.
2. Search for anything else that mentions the old role or employer, and
   show it to them before touching it:
   `grep -rn "<old employer>" src public/llms.txt 2>/dev/null`
3. With the dev server running:
   ```bash
   npm run cv && npm run og && npm run banner && npm run onepagers
   npm run check
   ```
   The CV must stay within two pages; see the `new-cert` skill for how to
   handle overflow.
4. Look at the home page, About and the CV in the Browser pane.

## 5. Two approvals, then stop

The diff, then separately the CV PDF. Commit. Remind them to upload the new
`assets/linkedin-banner.png` to LinkedIn if they use it. Run
`walkthrough-sync` if the walkthrough exists. They decide when to ship.
