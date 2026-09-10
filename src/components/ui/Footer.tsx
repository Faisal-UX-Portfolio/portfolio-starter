import { site, CV_URL, CV_DOWNLOAD_NAME } from '@/content/site'

export function Footer() {
  return (
    <footer className="border-t border-line print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          &copy; {new Date().getFullYear()} {site.name}
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 list-none m-0 p-0">
          <li>
            <a href={`mailto:${site.email}`} className="py-2 hover:text-ink">
              Email
            </a>
          </li>
          <li>
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="py-2 hover:text-ink">
              LinkedIn
            </a>
          </li>
          <li>
            <a href={CV_URL} download={CV_DOWNLOAD_NAME} className="py-2 hover:text-ink">
              CV
            </a>
          </li>
        </ul>
      </div>
    </footer>
  )
}
