'use client'

import { useEffect, useState } from 'react'

/**
 * Thin progress bar under the nav, filled in the study's accent colour.
 * Driven directly by scroll position, so it conveys information rather
 * than decoration and stays useful under reduced motion.
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0
    function update() {
      frame = 0
      const doc = document.documentElement
      const total = doc.scrollHeight - doc.clientHeight
      setProgress(total > 0 ? Math.min(window.scrollY / total, 1) : 0)
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="fixed top-16 left-0 right-0 h-1 pointer-events-none"
      style={{ zIndex: 'var(--z-nav)' as unknown as number }}
    >
      <div
        className="h-full origin-left"
        style={{ background: 'var(--accent)', transform: `scaleX(${progress})` }}
      />
    </div>
  )
}
