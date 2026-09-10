import { caseStudies } from '@/lib/case-studies'
import { site, SITE_URL, CV_URL } from '@/content/site'
import { cv, certMonth } from '@/content/cv'

/**
 * /llms.txt: a plain-text summary for AI tools reading the site. Generated
 * from the same data as the pages at build time, so it can never contradict
 * them. There is no hand-maintained copy to keep in step.
 */
export const dynamic = 'force-static'

export function GET() {
  const absolute = (url: string) => (url.startsWith('http') ? url : `${SITE_URL}${url}`)

  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.role}, ${site.location}. ${site.tagline}`,
    '',
    ...site.bio.flatMap((p) => [p, '']),
    '## Case studies',
    '',
    ...caseStudies.map((cs) =>
      cs.protected
        ? `- [${cs.title}](${SITE_URL}/case-studies/${cs.slug}): ${cs.client}. Passphrase protected; ask ${site.name} for access.`
        : `- [${cs.title}](${SITE_URL}/case-studies/${cs.slug}): ${cs.client}, ${cs.role}, ${cs.timeline}. ${cs.summary} Outcome: ${cs.outcome}.`
    ),
    '',
    '## Experience',
    '',
    ...cv.roles.map((r) => `- ${r.title}, ${r.employer} (${r.dates})`),
    '',
    '## Certifications',
    '',
    ...cv.certificates.map(
      (c) =>
        `- ${c.title}, ${c.institution}. Issued ${certMonth(c.issued)}, ${c.expires ? `valid to ${certMonth(c.expires)}` : 'no expiry'}. Credential ID ${c.credentialId}${c.url ? `: ${absolute(c.url)}` : ''}`
    ),
    '',
    '## Contact',
    '',
    `- Email: ${site.email}`,
    `- LinkedIn: ${site.linkedin}`,
    `- CV: ${absolute(CV_URL)}`,
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
