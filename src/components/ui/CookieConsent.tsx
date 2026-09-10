'use client'

import { useEffect, useState } from 'react'

/**
 * Cookie consent banner paired with Google Consent Mode. The layout sets
 * analytics_storage to "denied" by default before Analytics loads, so no
 * analytics cookies are set until the visitor accepts here. The choice is
 * remembered in localStorage, so the banner shows once per browser.
 *
 * Only rendered when NEXT_PUBLIC_GA_ID is set (see layout), so there is
 * nothing to consent to in local development.
 */

const STORAGE_KEY = 'analytics-consent'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let choice: string | null = null
    try {
      choice = localStorage.getItem(STORAGE_KEY)
    } catch {
      /* storage blocked: treat as undecided, banner shows */
    }
    if (choice === 'granted') {
      window.gtag?.('consent', 'update', { analytics_storage: 'granted' })
    } else if (choice !== 'denied') {
      setVisible(true)
    }
  }, [])

  function decide(granted: boolean) {
    try {
      localStorage.setItem(STORAGE_KEY, granted ? 'granted' : 'denied')
    } catch {
      /* storage blocked: honour the click for this page view only */
    }
    if (granted) {
      window.gtag?.('consent', 'update', { analytics_storage: 'granted' })
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-xl rounded-2xl border border-line bg-paper-raised p-5 shadow-card print:hidden sm:inset-x-auto sm:right-6 sm:bottom-6"
    >
      <p className="font-body text-sm text-ink leading-relaxed mb-4">
        This site uses Google Analytics to understand how visitors find and read
        the work. Analytics cookies are only set if you accept.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => decide(true)}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-ink text-paper text-sm font-display font-semibold hover:opacity-90 transition-colors"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => decide(false)}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border-2 border-ink/15 text-ink text-sm font-display font-semibold hover:border-ink transition-colors"
        >
          Decline
        </button>
      </div>
    </div>
  )
}
