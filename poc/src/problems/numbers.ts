/** Reading numbers out of problem text. */

const NUMBER_IN_TEXT = /\d+(?:,\d+)?/g
const FRACTION_IN_TEXT = /(\d+)\/(\d+)/g

/** The numbers in a piece of text, in order. A fraction m/n gives m and n. */
export function numbersIn(text: string): string[] {
  const found: { at: number; value: string }[] = []
  for (const match of text.matchAll(FRACTION_IN_TEXT)) {
    found.push({ at: match.index, value: match[1] }, { at: match.index + match[1].length + 1, value: match[2] })
  }
  const withoutFractions = text.replace(FRACTION_IN_TEXT, (fraction) => ' '.repeat(fraction.length))
  for (const match of withoutFractions.matchAll(NUMBER_IN_TEXT)) found.push({ at: match.index, value: match[0] })
  return found.sort((a, b) => a.at - b.at).map((f) => f.value)
}
