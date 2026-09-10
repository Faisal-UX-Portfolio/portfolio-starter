'use client'

import { useRef } from 'react'

/**
 * A metric highlighted like a marker-pen swipe, with an explanation of how
 * the number was derived.
 *
 * The explanation is real inline text kept in the DOM in brackets, right
 * after the figure, so screen readers and AI reviewers read it as part of
 * the sentence ("a 25% (measured as...) reduction"). It is server-rendered,
 * so it survives with JavaScript off. CSS collapses it at rest and presents
 * it as a floating card on hover, keyboard focus and tap (via focus).
 *
 * The one job left for JavaScript is to nudge the card back on screen when
 * the metric sits near a viewport edge. It measures at the moment the card
 * opens, when it has its real size, and uses layout width rather than the
 * card's rectangle, which is mid-transition at that instant.
 *
 * Usage in MDX: a <Metric note="how it was measured">25%</Metric> reduction
 */
export function Metric({ note, children }: { note: string; children: React.ReactNode }) {
  const wrapRef = useRef<HTMLSpanElement>(null)
  const noteRef = useRef<HTMLSpanElement>(null)

  function reposition() {
    const wrap = wrapRef.current
    const card = noteRef.current
    if (!wrap || !card) return
    const margin = 10
    // clientWidth, not innerWidth: innerWidth grows with any horizontal overflow
    const viewport = document.documentElement.clientWidth
    const box = wrap.getBoundingClientRect()
    const left = box.left + box.width / 2 - card.offsetWidth / 2
    const right = left + card.offsetWidth
    let shift = 0
    if (left < margin) shift = margin - left
    else if (right > viewport - margin) shift = viewport - margin - right
    card.style.setProperty('--metric-shift', `${Math.round(shift)}px`)
  }

  return (
    <span className="metric" ref={wrapRef} onPointerEnter={reposition} onFocus={reposition}>
      <mark className="metric-mark" tabIndex={0}>
        {children}
      </mark>
      <span ref={noteRef} className="metric-note">
        {' '}({note})
      </span>
    </span>
  )
}
