import { GitBranch } from 'lucide-react'

/**
 * A margin note recording a design decision: what was chosen, what was
 * rejected, and why. Rendered as a collapsed aside so it enriches the
 * narrative for readers who care about trade-offs without lengthening
 * the read for those who do not.
 *
 * Native details/summary keeps it keyboard-accessible with zero JS.
 */
export function DecisionLog({
  title,
  chose,
  rejected,
  because,
}: {
  title: string
  chose: string
  rejected: string
  because: string
}) {
  return (
    <details className="not-prose group my-8 rounded-2xl border border-line bg-paper-raised overflow-hidden">
      <summary className="flex items-center gap-3 cursor-pointer list-none p-5 select-none [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
          style={{ background: 'var(--accent-wash)' }}
        >
          <GitBranch size={14} style={{ color: 'var(--accent-ink)' }} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-mono text-2xs font-semibold uppercase tracking-widest text-ink-soft">
            The call I made
          </span>
          <span className="block font-display font-semibold text-ink leading-snug">{title}</span>
        </span>
        <span
          aria-hidden="true"
          className="font-display text-ink-soft transition-transform group-open:rotate-45 text-xl leading-none"
        >
          +
        </span>
      </summary>
      {/* Divs rather than p tags so .reading's paragraph margins stay out */}
      <div className="mx-5 pb-5 pt-4 space-y-3 border-t border-line">
        <div className="text-sm text-ink leading-relaxed">
          <span className="font-mono text-2xs font-semibold uppercase tracking-widest mr-2" style={{ color: 'var(--accent-ink)' }}>
            Chose
          </span>
          {chose}
        </div>
        <div className="text-sm text-ink leading-relaxed">
          <span className="font-mono text-2xs font-semibold uppercase tracking-widest text-ink-faint mr-2">
            Over
          </span>
          {rejected}
        </div>
        <div className="text-sm text-ink-soft leading-relaxed">
          <span className="font-mono text-2xs font-semibold uppercase tracking-widest text-ink-faint mr-2">
            Because
          </span>
          {because}
        </div>
      </div>
    </details>
  )
}
