/**
 * Everything the site says about you, in one place. The nav, footer, home
 * and about pages, structured data, llms.txt, the OG image and the
 * one-pagers all read from here, so changing a fact is one edit.
 *
 * The setup-portfolio skill fills this in by interviewing you. Anything that
 * still reads like a placeholder ("Your Name", example.com) is caught by
 * `npm run check -- --strict`, which runs before the first production deploy.
 */
export const site = {
  name: 'Your Name',
  role: 'Product Designer',
  tagline: 'One sentence on the kind of design problems you are best at.',
  location: 'City, Country',
  email: 'you@example.com',
  linkedin: 'https://www.linkedin.com/in/your-profile',
  /** The live address: your workers.dev URL until you connect a domain */
  url: 'https://portfolio.example.workers.dev',
  /** Language of the site, for the <html> element and search engines */
  locale: 'en-GB',
  bio: [
    'A short paragraph about who you are and what you do. Two or three sentences is plenty.',
    'A second paragraph about how you work, or what you are looking for next.',
  ],
  /** Verbatim quotes from people you have worked with. Never paraphrase them. */
  testimonials: [] as { quote: string; name: string; role: string }[],
}

export const SITE_URL = site.url
export const CV_URL = '/documents/cv.pdf'
export const CV_DOWNLOAD_NAME = `${site.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-cv.pdf`
