'use client'

import { useState, useRef } from 'react'
import { Lock } from 'lucide-react'
import { clsx } from 'clsx'
import { site } from '@/content/site'

// The passphrase is four words of four letters, joined with hyphens. The
// four boxes, auto-advance and paste handling are all built for that shape.
const WORDS = 4
const WORD_LENGTH = 4
const SEPARATOR = '-'

export function UnlockForm({
  slug,
  title,
  blurb,
  redirectTo,
  eyebrow = 'Protected case study',
}: {
  slug: string
  title: string
  blurb: string
  redirectTo: string
  eyebrow?: string
}) {
  const [values, setValues] = useState<string[]>(Array(WORDS).fill(''))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const submittedRef = useRef(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  async function submit(password: string) {
    if (submittedRef.current) return
    submittedRef.current = true
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, slug }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Incorrect passphrase. Please try again.')
        setValues(Array(WORDS).fill(''))
        submittedRef.current = false
        setTimeout(() => inputRefs.current[0]?.focus(), 0)
        return
      }

      window.location.href = redirectTo
    } catch {
      setError('Unable to connect. Please try again.')
      submittedRef.current = false
    } finally {
      setLoading(false)
    }
  }

  function maybeSubmit(next: string[]) {
    if (next.every((v) => v.length === WORD_LENGTH)) {
      submit(next.join(SEPARATOR))
    }
  }

  function handleChange(index: number, raw: string) {
    const val = raw.replace(/[^a-zA-Z]/g, '').toLowerCase().slice(0, WORD_LENGTH)
    const next = [...values]
    next[index] = val
    setValues(next)
    setError('')

    if (val.length === WORD_LENGTH && index < WORDS - 1) {
      inputRefs.current[index + 1]?.focus()
    }
    maybeSubmit(next)
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && values[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < WORDS - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').trim().toLowerCase()
    const parts = pasted.includes(SEPARATOR)
      ? pasted.split(SEPARATOR)
      : [pasted.slice(0, 4), pasted.slice(4, 8), pasted.slice(8, 12), pasted.slice(12, 16)]

    const next = values.map((_, i) => (parts[i] ?? '').replace(/[^a-z]/g, '').slice(0, WORD_LENGTH))
    setValues(next)
    const lastFilled = next.reduce((acc, v, i) => (v.length > 0 ? i : acc), 0)
    setTimeout(() => inputRefs.current[Math.min(lastFilled, WORDS - 1)]?.focus(), 0)
    maybeSubmit(next)
  }

  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-5 shadow-card sm:p-10">
      <div
        className="mb-7 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: 'var(--accent-wash)' }}
      >
        <Lock size={20} aria-hidden="true" style={{ color: 'var(--accent-ink)' }} />
      </div>

      <p className="eyebrow mb-2" style={{ color: 'var(--accent-ink)' }}>
        {eyebrow}
      </p>
      <h1 className="mb-2 font-display text-xl font-bold text-ink sm:text-3xl">{title}</h1>
      <p className="mb-9 font-body text-sm leading-relaxed text-ink-soft">{blurb}</p>

      <div role="group" aria-label="Four-word passphrase" aria-describedby={error ? 'unlock-error' : undefined}>
        <div className="mb-2 flex items-center gap-2">
          {values.map((val, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el
              }}
              // Mask each word once fully entered; editing reveals it again
              type={val.length === WORD_LENGTH ? 'password' : 'text'}
              inputMode="text"
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              maxLength={WORD_LENGTH}
              value={val}
              aria-label={`Word ${i + 1} of ${WORDS}`}
              autoFocus={i === 0}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              disabled={loading}
              className={clsx(
                'w-full min-w-0 rounded-lg border-2 bg-paper py-3.5 text-center font-mono text-base tracking-[0.2em] outline-none transition-colors duration-150 disabled:opacity-40',
                error ? 'border-red-600 text-ink' : 'border-line text-ink focus:border-[var(--accent)]'
              )}
            />
          ))}
        </div>

        {/* Numbers only: "Word 1" is wider than its box at large text sizes
            and ran into its neighbours. Each input carries its full
            "Word 1 of 4" label for screen readers. */}
        <div className="mb-6 flex gap-2" aria-hidden="true">
          {values.map((_, i) => (
            <p key={i} className="min-w-0 flex-1 text-center font-mono text-xs font-semibold text-ink-faint">
              {i + 1}
            </p>
          ))}
        </div>

        {error && (
          <p id="unlock-error" role="alert" className="mb-4 text-center text-sm font-semibold text-ink">
            {error}
          </p>
        )}
        {loading && (
          <p className="text-center text-sm text-ink-soft" aria-live="polite">
            Checking...
          </p>
        )}
      </div>

      <p className="mt-8 text-center text-xs text-ink-soft">
        Need the passphrase?{' '}
        <a
          href={`mailto:${site.email}`}
          className="font-semibold underline underline-offset-2 hover:no-underline"
          style={{ color: 'var(--accent-ink)' }}
        >
          Get in touch
        </a>
      </p>
    </div>
  )
}
