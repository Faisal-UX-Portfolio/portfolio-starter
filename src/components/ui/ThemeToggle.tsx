'use client'

import { useEffect, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'

/** Where an explicit choice is kept. Read by the pre-paint script in
    layout.tsx, which is the only other place that knows the key. */
const STORAGE_KEY = 'theme'

type Mode = 'light' | 'dark' | 'system'

const MODES = [
  { id: 'light', word: 'Light', Icon: Sun },
  { id: 'dark', word: 'Dark', Icon: Moon },
  { id: 'system', word: 'Match device', Icon: Monitor },
] as const

/**
 * Appearance control: light, dark, or follow the device.
 *
 * A segmented control rather than a cycling button, because a single icon
 * cannot say which of three states is active, and no glyph for "follow my
 * device" is universally read. Showing all three at once is what makes each
 * one legible, and it is one press to any state.
 *
 * Two things are decided in CSS rather than here (see `.seg-*` in
 * globals.css): which segment reads as active, and which one shows its word.
 * Both are a function of `data-theme` on <html>, which the pre-paint script
 * sets from localStorage before React exists. Deciding them on the client
 * would show the wrong segment selected until hydration.
 *
 * `aria-pressed` is the exception; it has to be in the DOM, so it is absent
 * on the server and correct from mount. Three buttons with `aria-pressed`
 * rather than a radiogroup: a radiogroup owes the user arrow-key navigation
 * and a single tab stop, and a half-built one that ignores arrow keys is
 * worse than plain buttons that behave exactly as they look.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [mode, setMode] = useState<Mode | undefined>(undefined)

  useEffect(() => {
    const pinned = document.documentElement.dataset.theme
    setMode(pinned === 'light' || pinned === 'dark' ? pinned : 'system')
  }, [])

  function choose(next: Mode) {
    setMode(next)

    if (next === 'system') delete document.documentElement.dataset.theme
    else document.documentElement.dataset.theme = next

    try {
      if (next === 'system') localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Private mode or blocked storage: the choice holds for this page only
    }
  }

  return (
    <div
      role="group"
      aria-label="Appearance"
      className={`inline-flex shrink-0 items-center gap-0.5 rounded-full border border-line bg-paper-sunken p-[3px] ${className ?? ''}`}
    >
      {MODES.map(({ id, word, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => choose(id)}
          aria-pressed={mode === undefined ? undefined : mode === id}
          aria-label={id === 'system' ? 'Match your device appearance' : `${word} appearance`}
          // ink-soft, not ink-faint: on the sunken tray the faint grey came
          // to 4.44:1, and an inactive segment is the only content of its
          // button, so it should not be arguing about which threshold applies.
          className={`seg seg-${id} inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-ink-soft transition-colors hover:text-ink`}
        >
          <Icon size={15} aria-hidden="true" />
          <span className="seg-word font-display text-2xs font-semibold">{word}</span>
        </button>
      ))}
    </div>
  )
}
