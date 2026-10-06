/**
 * Typed results, 2.1–4.7: she writes the action in her notebook and types its
 * result. A wrong result that a wrong sign gives with the same numbers (or the
 * swapped order, for − and :) gets that sign's hint, as ASSISTments' common
 * wrong answers do. Pure functions, no UI code.
 */
import { add, answersMatch, divide, equals, multiply, parseDecimal, subtract, type Decimal } from '../lib/decimal'
import { SIGNS, type Action, type Sign } from '../problems/types'
import type { Verdict } from '../guided/checks'

export const DEFAULT_ACTION_HINT = 'Подивись на короткий запис: що треба знайти цією дією?'

function fold(values: readonly Decimal[], sign: Sign): Decimal | null {
  const [first, ...rest] = values
  let value: Decimal | null = first
  for (const next of rest) {
    if (value === null) return null
    switch (sign) {
      case '+':
        value = add(value, next)
        break
      case '−':
        value = subtract(value, next)
        break
      case '·':
        value = multiply(value, next)
        break
      case ':':
        value = divide(value, next)
        break
    }
  }
  return value
}

/**
 * The results a wrong sign gives with the action's own numbers: each other
 * sign in the action's order, and − and : also with two numbers swapped.
 * Results that aren't exact, aren't positive, or equal the right result are
 * left out, since they can't tell a sign apart.
 */
export function wrongSignResults(action: Action): { sign: Sign; value: Decimal }[] {
  const terms = action.terms.map(parseDecimal)
  const right = parseDecimal(action.result)
  if (terms.some((t) => t === null) || !right) return []
  const values = terms as Decimal[]
  const found: { sign: Sign; value: Decimal }[] = []
  const keep = (sign: Sign, value: Decimal | null) => {
    if (!value || value.units <= 0n || equals(value, right)) return
    if (!found.some((f) => equals(f.value, value))) found.push({ sign, value })
  }
  for (const sign of SIGNS) {
    if (sign === action.sign) continue
    keep(sign, fold(values, sign))
    if ((sign === '−' || sign === ':') && values.length === 2) keep(sign, fold([values[1], values[0]], sign))
  }
  return found
}

/** The wrong sign that gives her result with the action's numbers, or null if none does. */
export function inferSign(action: Action, typed: string): Sign | null {
  const value = parseDecimal(typed)
  if (!value) return null
  return wrongSignResults(action).find((r) => equals(r.value, value))?.sign ?? null
}

/** Her typed result for an action. A wrong one gets the hint for the sign it came from, or «Не сходиться» and the action's hint. */
export function checkResult(action: Action, typed: string): Verdict {
  if (!parseDecimal(typed)) return { kind: 'empty', message: 'Введи результат.' }
  if (answersMatch(typed, action.result)) return { kind: 'right' }
  const sign = inferSign(action, typed)
  const hint = action.hint ?? DEFAULT_ACTION_HINT
  if (sign) return { kind: 'wrong', hint: action.signHints?.[sign] ?? hint, sign }
  return { kind: 'wrong', hint: `Не сходиться. ${hint}` }
}
