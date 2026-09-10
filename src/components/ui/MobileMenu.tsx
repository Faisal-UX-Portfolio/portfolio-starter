'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'

/**
 * The small-screen menu: a native <details>, which already opens, closes
 * and works from the keyboard with no JavaScript. The script adds only what
 * <details> lacks. It closes once a link inside it is followed: the nav
 * persists across page changes, so it would otherwise stay open over the
 * new page. And it closes on Escape, returning focus to the menu button.
 */
export function MobileMenu({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDetailsElement>(null)
  const pathname = usePathname()

  // Covers back and forward too, not just clicks inside the menu
  useEffect(() => {
    if (ref.current) ref.current.open = false
  }, [pathname])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const menu = ref.current
      if (event.key !== 'Escape' || !menu?.open) return
      menu.open = false
      menu.querySelector('summary')?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <details ref={ref} className={`relative shrink-0 ${className ?? ''}`}>
      <summary
        aria-label="Menu"
        className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full text-ink [&::-webkit-details-marker]:hidden"
      >
        <Menu size={20} aria-hidden="true" />
      </summary>
      <div
        // A link to the page already showing changes no pathname, so close on the click itself as well
        onClick={(event) => {
          if ((event.target as HTMLElement).closest('a') && ref.current) ref.current.open = false
        }}
        className="absolute right-0 mt-2 w-max max-w-[calc(100vw-2.5rem)] rounded-2xl border border-line bg-paper-raised p-2 shadow-card"
      >
        {children}
      </div>
    </details>
  )
}
