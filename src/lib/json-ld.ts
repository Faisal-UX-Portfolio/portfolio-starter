/**
 * Serialises structured data for a <script type="application/ld+json">
 * block. Escaping `<` means no string in the data, however it was written,
 * can close the script element early and inject markup.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
