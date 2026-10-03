/**
 * Exact decimal numbers for answers written the school's way: `12,442`.
 *
 * A value is an integer count of units and a scale (value = units / 10^scale),
 * held in a BigInt, so `0,1 + 0,2` is exactly `0,3` with no floating-point error.
 * Values are always normalized (no trailing fractional zeros), so two equal
 * numbers have identical fields.
 */
export type Decimal = { readonly units: bigint; readonly scale: number }

const NUMBER = /^([-−]?)(\d*)(?:[,.](\d*))?$/

function normalize(units: bigint, scale: number): Decimal {
  while (scale > 0 && units % 10n === 0n) {
    units /= 10n
    scale--
  }
  return { units, scale }
}

/**
 * Reads `12,442`, `12.442`, `0,5`, `,5`, `3 000` or `−4`. Spaces (thousands
 * groups) are ignored. Returns null for anything that isn't a single number,
 * including an empty string.
 */
export function parseDecimal(text: string): Decimal | null {
  const match = NUMBER.exec(text.replace(/[\s  ]/g, ''))
  if (!match) return null
  const [, sign, whole, fraction = ''] = match
  if (!whole && !fraction) return null
  const units = BigInt((whole || '0') + fraction)
  return normalize(sign ? -units : units, fraction.length)
}

/** Writes a value with a decimal comma: `12,442`, `0,3`, `−4`. */
export function formatDecimal(value: Decimal): string {
  const negative = value.units < 0n
  const digits = (negative ? -value.units : value.units).toString().padStart(value.scale + 1, '0')
  const whole = digits.slice(0, digits.length - value.scale)
  const fraction = digits.slice(digits.length - value.scale)
  return (negative ? '−' : '') + whole + (fraction ? ',' + fraction : '')
}

function aligned(a: Decimal, b: Decimal): [bigint, bigint, number] {
  const scale = Math.max(a.scale, b.scale)
  return [a.units * 10n ** BigInt(scale - a.scale), b.units * 10n ** BigInt(scale - b.scale), scale]
}

export function add(a: Decimal, b: Decimal): Decimal {
  const [x, y, scale] = aligned(a, b)
  return normalize(x + y, scale)
}

export function subtract(a: Decimal, b: Decimal): Decimal {
  const [x, y, scale] = aligned(a, b)
  return normalize(x - y, scale)
}

export function multiply(a: Decimal, b: Decimal): Decimal {
  return normalize(a.units * b.units, a.scale + b.scale)
}

/**
 * Divides exactly. Returns null when dividing by zero or when the quotient
 * has no finite decimal form (like 10 : 3).
 */
export function divide(a: Decimal, b: Decimal): Decimal | null {
  if (b.units === 0n) return null
  let numerator = a.units * 10n ** BigInt(b.scale)
  let denominator = b.units * 10n ** BigInt(a.scale)
  if (denominator < 0n) {
    numerator = -numerator
    denominator = -denominator
  }
  const divisor = gcd(numerator < 0n ? -numerator : numerator, denominator)
  numerator /= divisor
  denominator /= divisor
  // The quotient terminates only if the reduced denominator is 2^m · 5^n.
  let scale = 0
  let power = 1n
  while (power % denominator !== 0n) {
    power *= 10n
    scale++
    if (scale > 64) return null
  }
  return normalize(numerator * (power / denominator), scale)
}

function gcd(a: bigint, b: bigint): bigint {
  while (b !== 0n) [a, b] = [b, a % b]
  return a
}

/** -1, 0 or 1, as a is less than, equal to or greater than b. */
export function compare(a: Decimal, b: Decimal): -1 | 0 | 1 {
  const [x, y] = aligned(a, b)
  if (x < y) return -1
  if (x > y) return 1
  return 0
}

export function equals(a: Decimal, b: Decimal): boolean {
  return compare(a, b) === 0
}

/**
 * The answer check: true when the learner's input is the same number as the
 * expected one, however it's written (`12,40` matches `12,4`). False if either
 * isn't a number.
 */
export function answersMatch(input: string, expected: string): boolean {
  const a = parseDecimal(input)
  const b = parseDecimal(expected)
  return a !== null && b !== null && equals(a, b)
}
