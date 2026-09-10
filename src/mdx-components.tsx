import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    img: ({ src, alt, ...props }) => (
      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt ?? ''} loading="lazy" {...props} />
        {alt && <figcaption aria-hidden="true">{alt}</figcaption>}
      </figure>
    ),
    /**
     * Tables scroll inside their own box rather than widening the page.
     * A table's columns size to their content, so at a large text size the
     * outcome tables in the case studies pushed the whole article sideways
     * (252px at 200% on a 375 viewport). The wrapper is a div rather than
     * `display: block` on the table itself, which would have been fewer
     * characters but strips the table semantics screen readers rely on.
     * tabIndex makes the scroll box reachable by keyboard, since a region
     * that scrolls must be scrollable without a pointer.
     */
    table: (props) => (
      <div className="reading-scroll" tabIndex={0} role="region" aria-label="Table">
        <table {...props} />
      </div>
    ),
  }
}
