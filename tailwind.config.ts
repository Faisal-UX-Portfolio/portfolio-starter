import type { Config } from 'tailwindcss'

/**
 * Design tokens. The neutral colours read the light-dark() variables in
 * globals.css through relative colour syntax, so one declaration serves
 * both `bg-paper` and opacity modifiers like `border-ink/15`, in both
 * appearances. Values live in globals.css, once each; this file holds none.
 *
 * Case study accents are not here: each study declares its own colour in
 * src/content/studies.ts, applied through accentStyle() as --accent,
 * --accent-ink and --accent-wash.
 */
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: 'rgb(from var(--paper) r g b / <alpha-value>)',
          raised: 'rgb(from var(--paper-raised) r g b / <alpha-value>)',
          sunken: 'rgb(from var(--paper-sunken) r g b / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(from var(--ink) r g b / <alpha-value>)',
          soft: 'rgb(from var(--ink-soft) r g b / <alpha-value>)',
          faint: 'rgb(from var(--ink-faint) r g b / <alpha-value>)',
        },
        'on-inverted': 'rgb(var(--on-inverted-rgb) / <alpha-value>)',
        line: 'var(--line)',
        inverted: {
          DEFAULT: 'var(--surface-inverted)',
          soft: 'var(--surface-inverted-soft)',
        },
        /** The CV is a printed document, not site chrome: fixed greys. */
        cv: {
          ink: '#222222',
          muted: '#6b6b6b',
          rule: '#888888',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
        cv: ['"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}

export default config
