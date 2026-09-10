---
name: new-cert
description: Add a professional certification to the portfolio, including the CV. Run when the owner says "new-cert", "/new-cert", "I've got a new certification", "I passed [x]", or asks to add a qualification or credential. Interviews them for the exact details, adds one entry to src/content/cv.ts, files the certificate image or PDF, regenerates the CV, checks it, and stops for approval. Never ships on its own.
---

# New certification

Everything public derives from one array, `cv.certificates` in
`src/content/cv.ts`. One entry there reaches the Certifications page, the
CV and its PDF, the structured data search engines read, `llms.txt`, and
the count on the home page. Nothing else needs editing by hand except the
files below.

## Ground rules

- **Facts come from the certificate.** Never guess a date, credential ID or
  the wording of a title. A wrong qualification claim is a credibility
  problem.
- No edit before the owner approves the plan in step 3.
- The CV PDF is approved separately from the change itself: it is the
  document that goes to employers.
- Commit to `staging`; never push to `main`.

## 1. Preflight

```bash
git branch --show-current && git status --short && git pull
```

## 2. Interview

If they have shared the certificate (PDF or image), read it and confirm the
details back rather than asking cold. Collect:

- **Title**, exactly as printed on the certificate
- **Issuing body**, exactly as it names itself
- **Issue month and year**
- **Expiry month and year**, or explicit confirmation it never expires. Ask;
  do not infer from silence.
- **Credential ID**
- **Verification URL**, if the issuer has one. If not, the certificate PDF
  itself will be hosted instead, under `/documents/`.

The shape:

```ts
{
  title: string
  institution: string
  issued: 'YYYY-MM'
  expires?: 'YYYY-MM'   // leave out entirely if it never expires
  credentialId: string
  url?: string          // verification page, or '/documents/<file>.pdf'
  preview?: string      // '/documents/<name>-certificate.webp'
}
```

**The image** (optional but worth having: the card opens it in a dialog).
From a PDF: `pdftoppm -png -r 150 -singlefile cert.pdf out` if available,
otherwise open it in Chrome with puppeteer-core and screenshot it. Save as
WebP under `public/documents/` (sharp is installed:
`node -e "require('sharp')('out.png').webp({quality:84}).resize(1400).toFile('...')"`).
Keeping it under `/documents/` means the lockdown covers it. Check by eye
that the name and dates are legible.

## 3. Plan, then wait

Show the exact entry, where it goes (newest first), and the file names.
Wait for approval.

## 4. Edit, regenerate, check

1. Add the entry to the top of `cv.certificates`.
2. Put any PDF and image in `public/documents/`.
3. With the dev server running: `npm run cv`. It refuses to write a CV over
   two pages. If one more certification pushes it over, tighten existing
   wording, and if nothing can go without losing something real, ask the
   owner what to remove. Never shrink the type or the margins.
4. `npm run check`.
5. Look at `/certifications` in the Browser pane.

## 5. Two approvals, then stop

Show the diff for approval. Separately, show the regenerated
`public/documents/cv.pdf` and get approval for that. Commit. Run
`walkthrough-sync` if the walkthrough exists. They decide when to ship.
