# Portfolio starter

A complete portfolio website for a designer, ready to become yours.

The engine is built: case studies written as simple documents, image
handling, a passphrase to protect confidential case studies (or the whole
site in an emergency), a CV page that prints itself to a PDF, a
certifications page, share images for LinkedIn and friends, automated tests
and security checks, and free hosting on Cloudflare.

What it does not have yet is **your design**. Claude Code works that out with
you: you show it websites you like, it interviews you about them, designs
your home page and a case study page, and builds the site once you approve.

## Start here

You need a Mac with an internet connection. Everything else is free.

1. **Install the Claude desktop app** from https://claude.ai/download and
   sign in. Open the **Code** tab.
2. **Get this project.** In a new Code session, say:

   > Clone https://github.com/Faisal-UX-Portfolio/portfolio-starter into my
   > Documents folder as my-portfolio, and open it.

3. **In that project, say "set up my portfolio".**

That is all. Claude guides you from there, one step at a time, and you can
stop whenever you like and say "continue setup" later.

## What setup does

1. Checks your computer has what it needs, and creates your passphrase
2. Installs a few useful skills (Ponytail, Impeccable, Apple design)
3. Asks about you, and reads your current CV
4. Goes through your moodboard of sites you like, one at a time
5. Designs your home page and a case study page, with up to two rounds of
   feedback
6. Builds the site from the approved designs, then has it tested and
   security reviewed
7. Shows you where your own case studies, images and CV go
8. Puts it online: a GitHub account to hold the code, a Cloudflare account to
   host it, a private staging copy and the live site. Your own domain is
   optional.
9. Makes a guide explaining how your site works

Two example case studies (Harbourline Ferries and Meadowbank Libraries) are
included so you can judge the design with realistic content. Both are
fictional, and setup replaces them with yours.

## Once it is live

Say what you want in plain English. The phrases worth knowing:

| Say | What happens |
|---|---|
| "Add a case study" | An interview, then your study on the staging copy |
| "I've got a new certification" | Added to the site and your CV |
| "I've got a new job" | Your role updated everywhere, CV included |
| "Ship it" | Checks everything, then puts staging live |
| "Lockdown" / "Reopen" | Puts the whole site behind your passphrase, or lifts it |

## For the curious

- `CLAUDE.md`: the rules Claude follows in this project
- `MECHANICS.md`: how it all works, in plain English
- `STANDARDS.md`: the design, code and security standards, and the checks
  that prove they still hold
- `GO-LIVE.md`: where your launch stands, and how deployment works
- `docs/SECURITY.md`: what the passphrase protects, and what it does not

Built with Next.js, React, Tailwind CSS and MDX, deployed to Cloudflare
Workers with OpenNext.
