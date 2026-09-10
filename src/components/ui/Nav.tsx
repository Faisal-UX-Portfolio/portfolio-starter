import Link from 'next/link'
import { Menu } from 'lucide-react'
import { site } from '@/content/site'
import { ThemeToggle } from './ThemeToggle'

const LINKS = [
  { href: '/case-studies', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/certifications', label: 'Certifications' },
]

/**
 * Baseline navigation. The full row appears only from the `nav` breakpoint
 * (64em in tailwind.config.ts). Below it, the links and the appearance
 * control move into a native <details> menu, keyboard accessible with no
 * JavaScript.
 *
 * The breakpoint is in em, not px, on purpose: em in a media query tracks
 * the reader's text size, so at 200% text every real screen gets the menu,
 * and the bar never overflows however large the text is set.
 */
export function Nav() {
  return (
    <header
      className="fixed inset-x-0 top-0 h-16 border-b border-line bg-paper/90 backdrop-blur print:hidden"
      style={{ zIndex: 'var(--z-nav)' as unknown as number }}
    >
      <nav aria-label="Main" className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="min-w-0 truncate font-display font-bold text-ink">
          {site.name}
        </Link>

        <div className="hidden items-center gap-6 nav:flex">
          <ul className="m-0 flex list-none items-center gap-6 p-0">
            {LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="py-2 text-sm font-semibold text-ink-soft transition-colors hover:text-ink">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <ThemeToggle />
        </div>

        <details className="relative shrink-0 nav:hidden">
          <summary
            aria-label="Menu"
            className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full text-ink [&::-webkit-details-marker]:hidden"
          >
            <Menu size={20} aria-hidden="true" />
          </summary>
          <div className="absolute right-0 mt-2 w-max max-w-[calc(100vw-2.5rem)] rounded-2xl border border-line bg-paper-raised p-2 shadow-card">
            <ul className="m-0 list-none p-0">
              {LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="block rounded-lg px-4 py-3 text-sm font-semibold text-ink hover:bg-paper-sunken">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-t border-line px-2 pt-2 mt-1">
              <ThemeToggle />
            </div>
          </div>
        </details>
      </nav>
    </header>
  )
}
