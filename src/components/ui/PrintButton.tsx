'use client'

import { Printer } from 'lucide-react'

/**
 * Triggers the browser print dialogue, where every browser offers
 * "Save as PDF". Keeps the one-pager permanently in sync with the live
 * content instead of shipping pre-baked files that go stale.
 */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-6 py-3.5 bg-ink text-paper text-sm font-display font-semibold rounded-full hover:opacity-90 transition-colors print:hidden"
    >
      <Printer size={15} aria-hidden="true" />
      Save as PDF
    </button>
  )
}
