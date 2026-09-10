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
 * Baseline navigation. Below the md breakpoint the links move into a native
 * <details> menu, which is keyboard accessible with no JavaScript.
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

        <div className="flex items-center gap-2 sm:gap-5">
          <ul className="hidden md:flex items-center gap-6 list-none m-0 p-0">
            {LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="py-2 text-sm font-semibold text-ink-soft hover:text-ink transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <ThemeToggle />
          <details className="relative md:hidden">
            <summary
              aria-label="Menu"
              className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full text-ink [&::-webkit-details-marker]:hidden"
            >
              <Menu size={20} aria-hidden="true" />
            </summary>
            <ul className="absolute right-0 mt-2 w-52 list-none rounded-2xl border border-line bg-paper-raised p-2 shadow-card">
              {LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="block rounded-lg px-4 py-3 text-sm font-semibold text-ink hover:bg-paper-sunken">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </nav>
    </header>
  )
}
