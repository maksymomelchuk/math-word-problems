import type { TextPart } from './types'

/** The pieces of a quote from the problem, split at « … » where words are left out. */
export function quotePieces(quote: string): string[] {
  return quote
    .split('…')
    .map((piece) => piece.trim())
    .filter(Boolean)
}

/** True if every piece of the quote is in the problem text, in order: the quote is the problem's own words. */
export function quoteInText(quote: string, text: readonly TextPart[]): boolean {
  const pieces = quotePieces(quote)
  const whole = text.map((part) => part.text).join('')
  let from = 0
  for (const piece of pieces) {
    const at = whole.indexOf(piece, from)
    if (at < 0) return false
    from = at + piece.length
  }
  return pieces.length > 0
}
