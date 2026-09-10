import type { CaseStudyMeta } from '@/lib/case-studies'

/**
 * Your case studies, in the order the site lists them.
 *
 * To add one: add an entry here, write src/content/case-studies/<slug>.mdx,
 * and put its images in public/case-studies/<slug>/. The `new-case-study`
 * skill does all three with you. `npm run check` fails if an entry has no
 * MDX file, an MDX file has no entry, or an image is missing.
 *
 * Both studies below are fictional demo content, there so the design can be
 * reviewed before any real work goes in. Delete them (and their MDX files
 * and image folders) once your own studies are in.
 */
export const caseStudies: CaseStudyMeta[] = [
  {
    slug: 'harbourline-ferries',
    title: 'Rebooking a disrupted ferry journey in under a minute',
    client: 'Harbourline Ferries',
    tags: ['Service Design', 'Mobile', 'Demo'],
    summary:
      'A fictional demo study. A regional ferry operator lost most of its disrupted passengers to the phone queue. Research with crew and passengers led to a self-service rebooking flow and a single disruption message that tells people what to do next.',
    coverImage: '/case-studies/harbourline-ferries/cover.svg',
    coverAlt: 'Placeholder cover: a stylised ferry route between two harbours',
    colour: {
      accent: '#0E7C86',
      ink: '#0B5F66',
      glow: '#4FC3CC',
      wash: '#DDF1F2',
      washDark: 'rgba(14, 124, 134, 0.2)',
    },
    role: 'Lead Product Designer',
    timeline: '12 weeks',
    industry: 'Transport',
    deliverables: ['Disruption service blueprint', 'Rebooking flow', 'Crew message templates', 'Usability test report'],
    outcome: 'Demo figure: rebooking time down from 14 minutes on the phone to 50 seconds in the app',
    endorsement: {
      quote: 'This is a placeholder endorsement, here to show where a real quote appears.',
      name: 'Demo Person',
      role: 'Head of Customer Operations, Harbourline Ferries',
    },
    protected: true,
    featured: true,
    demo: true,
  },
  {
    slug: 'meadowbank-library',
    title: 'A library app people actually renew books with',
    client: 'Meadowbank Libraries',
    tags: ['Product Design', 'Public Sector', 'Demo'],
    summary:
      'A fictional demo study. A council library service had an app that most members installed once and never opened again. A short discovery found the one job people came back for, and the redesign built everything around it.',
    coverImage: '/case-studies/meadowbank-library/cover.svg',
    coverAlt: 'Placeholder cover: a stack of books beside a phone',
    colour: {
      accent: '#C2410C',
      ink: '#9A3412',
      glow: '#FB923C',
      wash: '#FFEDD5',
      washDark: 'rgba(194, 65, 12, 0.2)',
    },
    role: 'Product Designer',
    timeline: '6 weeks',
    industry: 'Public sector',
    deliverables: ['Discovery interviews', 'Redesigned home screen', 'Renewal reminders'],
    outcome: 'Demo figure: monthly active members up from 9% to 31% of installs',
    featured: true,
    demo: true,
  },
]
