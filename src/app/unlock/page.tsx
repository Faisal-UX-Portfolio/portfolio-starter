import type { Metadata } from 'next'
import { UnlockForm } from '@/components/unlock/UnlockForm'
import { LOCKDOWN_SLUG } from '@/lib/lockdown'

export const metadata: Metadata = {
  title: 'Temporarily closed',
  robots: { index: false, follow: false },
}

/**
 * The site-wide lock screen, reached only while LOCKDOWN is true (see
 * src/lib/lockdown.ts). The route stays in the build when the site is open,
 * so flipping the switch needs no new page, just a redeploy.
 */
export default function SiteUnlockPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-16">
      <div className="w-full max-w-lg pb-16">
        <UnlockForm
          slug={LOCKDOWN_SLUG}
          eyebrow="Portfolio closed"
          title="Temporarily closed"
          blurb="This portfolio is closed for the moment. Enter the four-word passphrase if you have it, or get in touch and I will send it over."
          redirectTo="/"
        />
      </div>
    </div>
  )
}
