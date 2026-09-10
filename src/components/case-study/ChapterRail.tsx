'use client'

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'

interface Chapter {
  id: string
  label: string
}

/**
 * Sticky chapter navigation for the deep layer. Reads the h2 headings out
 * of the rendered article, so the MDX content needs no extra markup, and
 * highlights the chapter currently in view.
 */
export function ChapterRail({ articleId }: { articleId: string }) {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const article = document.getElementById(articleId)
    if (!article) return

    const headings = Array.from(article.querySelectorAll<HTMLHeadingElement>('h2[id]'))
    setChapters(headings.map((h) => ({ id: h.id, label: h.textContent ?? '' })))

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )
    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [articleId])

  if (chapters.length < 2) return null

  return (
    <nav aria-label="Chapters" className="hidden xl:block">
      <p className="font-mono text-2xs font-semibold uppercase tracking-widest text-ink-soft mb-4">
        Chapters
      </p>
      <ol className="list-none m-0 p-0 flex flex-col gap-1 border-l-2 border-line">
        {chapters.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={activeId === id ? 'true' : undefined}
              className={clsx(
                'block -ml-0.5 border-l-2 pl-4 py-1.5 text-sm leading-snug transition-colors',
                activeId === id
                  ? 'font-semibold text-ink'
                  : 'border-transparent text-ink-soft hover:text-ink'
              )}
              style={activeId === id ? { borderColor: 'var(--accent)' } : undefined}
            >
              {label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
