/**
 * Your CV, as data. The source of truth for public/documents/cv.pdf, which
 * `npm run cv` generates from the /cv page with the dev server running. It
 * also feeds /certifications and the structured data search engines read.
 *
 * Edit here, run `npm run cv`, commit both. The generator refuses to write
 * a CV longer than two pages.
 *
 * Your phone number deliberately lives in CV_PHONE in .env.local rather
 * than here, so it stays off the site's pages. It does go into the PDF,
 * which anyone can download, so leave it out unless you want it public.
 *
 * Everything below is placeholder content. The setup-portfolio skill
 * replaces it with yours.
 */

export type CvSkill = {
  name: string
  level: 'Expert' | 'Advanced' | 'Proficient'
}

export type CvRole = {
  title: string
  dates: string
  employer: string
  /** A sentence setting the scene, above the bullets */
  intro?: string
  bullets: string[]
}

export type CvCertificate = {
  title: string
  institution: string
  /** Month awarded, as YYYY-MM */
  issued: string
  /** Month it lapses, as YYYY-MM. Leave out if it never expires. */
  expires?: string
  credentialId: string
  /** The issuer's verification page, or a PDF under /documents when there is none */
  url?: string
  /** An image of the certificate under public/, shown in a dialog */
  preview?: string
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** '2026-08' reads as 'Aug 2026' */
export function certMonth(month: string): string {
  const [year, index] = month.split('-')
  return `${MONTHS[Number(index) - 1]} ${year}`
}

/** The year range the CV prints: a certificate with no expiry runs to Present */
export function certCvDates(cert: CvCertificate): string {
  return `${cert.issued.slice(0, 4)} - ${cert.expires ? cert.expires.slice(0, 4) : 'Present'}`
}

export const cv: {
  summary: string
  roles: CvRole[]
  certificates: CvCertificate[]
  skills: CvSkill[]
} = {
  summary:
    'A placeholder summary. Three or four sentences on your experience, the kind of problems you solve, and the outcomes you are known for.',

  roles: [
    {
      title: 'Senior Product Designer',
      dates: '2023 - Present',
      employer: 'Example Company',
      intro: 'A sentence about what the company does.',
      bullets: [
        'A placeholder achievement. Lead with the outcome, then how you got there.',
        'A second placeholder achievement with a real number once you have one.',
      ],
    },
    {
      title: 'Product Designer',
      dates: '2020 - 2023',
      employer: 'Another Example Ltd',
      bullets: ['A placeholder achievement from an earlier role.'],
    },
  ],

  /** Newest first, which is the order /certifications reads in */
  certificates: [
    {
      title: 'Example Certificate in UX Design',
      institution: 'Example Institute',
      issued: '2022-05',
      credentialId: '00000000',
      url: 'https://example.com/verify/00000000',
    },
  ],

  skills: [
    { name: 'User Research', level: 'Expert' },
    { name: 'Interaction Design', level: 'Expert' },
    { name: 'Prototyping', level: 'Advanced' },
    { name: 'Design Systems', level: 'Advanced' },
  ],
}
