/**
 * The answer checks of a guided problem, as pure functions: what counts as
 * right, and which hint a wrong answer gets.
 */
import { answersMatch, equals, parseDecimal } from '../lib/decimal'
import { SIGNS, type Action, type Direction, type DirectionCheck, type Option, type PlanStep, type ProblemTypeId, type Relation, type Sign, type SolutionPlan } from '../problems/types'

export type Verdict =
  | { kind: 'empty'; message: string }
  | { kind: 'right' }
  /** `sign`: in Обчисли, the wrong sign she built the action with. */
  | { kind: 'wrong'; hint: string; slip?: boolean; sign?: Sign }

export const SLIP_HINT = 'Дію складено правильно. Перевір обчислення.'
export const LAST_ACTION_HINT = 'Остання дія має знаходити те, що питають у задачі.'
export const MISSING_ACTION_HINT = 'Чогось не вистачає. Що треба знайти раніше, щоб знайти шукане?'

export function rightOption(options: readonly Option[]): number {
  return options.findIndex((option) => 'right' in option)
}

/** A pick from a menu. */
export function checkOption(options: readonly Option[], picked: number | null): Verdict {
  if (picked === null) return { kind: 'empty', message: 'Вибери відповідь.' }
  const option = options[picked]
  return 'right' in option ? { kind: 'right' } : { kind: 'wrong', hint: option.hint }
}

/** The type of every listed relation. `wrong` lists the relations to mark. */
export function checkTypes(relations: readonly Relation[], picks: readonly (ProblemTypeId | undefined)[]): Verdict & { wrong: number[] } {
  if (relations.some((_, i) => !picks[i])) return { kind: 'empty', message: "Вибери тип для кожного зв'язку.", wrong: [] }
  const wrong = relations.flatMap((relation, i) => (picks[i] === relation.type ? [] : [i]))
  if (wrong.length) return { kind: 'wrong', hint: relations[wrong[0]].hint, wrong }
  return { kind: 'right', wrong }
}

/** Every slot of a diagram. `wrong` lists the slots to mark. */
export function checkSlots(slots: Readonly<Record<string, string>>, fill: Readonly<Record<string, string>>, hint: string): Verdict & { wrong: string[] } {
  const ids = Object.keys(slots)
  if (ids.some((id) => !fill[id])) return { kind: 'empty', message: 'Заповни всі порожні місця.', wrong: [] }
  const wrong = ids.filter((id) => fill[id] !== slots[id])
  return wrong.length ? { kind: 'wrong', hint, wrong } : { kind: 'right', wrong }
}

// ---------- plan ----------

/** Quantities that can end a plan: the last action of any valid plan finds something asked. */
export function askedActions(plans: readonly SolutionPlan[]): Set<string> {
  return new Set(plans.map((p) => p.actions[p.actions.length - 1].id))
}

/** The number of plan slots to show: the plans' length when they all agree, else null (no slot count). */
export function slotCount(plans: readonly SolutionPlan[], hideSlotCount = false): number | null {
  const lengths = new Set(plans.map((p) => p.actions.length))
  return !hideSlotCount && lengths.size === 1 ? [...lengths][0] : null
}

/** The 0-based indexes of the actions that must come before action `index`. */
export function prerequisites(actions: readonly Action[], index: number): number[] {
  const needs = actions[index].needs
  return needs ? needs.map((n) => n - 1) : Array.from({ length: index }, (_, i) => i)
}

/** True if every action comes after the actions it needs. `order` holds action indexes. */
export function respectsNeeds(actions: readonly Action[], order: readonly number[]): boolean {
  return order.every((index, position) =>
    prerequisites(actions, index).every((needed) => {
      const at = order.indexOf(needed)
      return at > -1 && at < position
    }),
  )
}

export type PlanMatch =
  | { kind: 'empty'; message: string }
  | { kind: 'wrong'; hint: string }
  /** `order` lists the plan's action indexes in the order she put them. */
  | { kind: 'right'; plan: number; order: number[] }

/**
 * Her plan cards, in her order, against every valid plan. A plan matches when
 * it has exactly her cards and her order keeps each action after the ones it
 * needs, so swappable actions are accepted in either order. `slots` is the
 * slot count shown, or null when she decides how many actions there are.
 */
export function matchPlan(plans: readonly SolutionPlan[], step: PlanStep, cards: readonly string[], slots: number | null): PlanMatch {
  if (slots !== null && cards.length < slots) return { kind: 'empty', message: 'Заповни всі дії плану.' }
  if (slots === null && cards.length === 0) return { kind: 'empty', message: 'Постав картки в план.' }

  for (const [planIndex, candidate] of plans.entries()) {
    if (candidate.actions.length !== cards.length) continue
    const order = cards.map((card) => candidate.actions.findIndex((action) => action.id === card))
    if (order.some((index) => index < 0)) continue
    if (respectsNeeds(candidate.actions, order)) return { kind: 'right', plan: planIndex, order }
  }

  const distractor = step.cards.find((card) => card.reason && cards.includes(card.id))
  if (distractor?.reason) return { kind: 'wrong', hint: distractor.reason }
  if (!askedActions(plans).has(cards[cards.length - 1])) return { kind: 'wrong', hint: LAST_ACTION_HINT }
  const shortOfAPlan = plans.some((p) => p.actions.length > cards.length && cards.every((card) => p.actions.some((a) => a.id === card)))
  if (shortOfAPlan) return { kind: 'wrong', hint: MISSING_ACTION_HINT }
  return { kind: 'wrong', hint: step.orderHint }
}

// ---------- compute ----------

/** The number chips are any numbers; signs are the school's four. */
export function isSign(token: string): token is Sign {
  return (SIGNS as readonly string[]).includes(token)
}

export const MAX_TERMS = 4

/**
 * The action she is building after one more chip. Tokens alternate number,
 * sign, number… A sign can't come first, a second sign replaces the first,
 * and a number tapped right after a number replaces it.
 */
export function appendToken(tokens: readonly string[], token: string): string[] {
  const last = tokens[tokens.length - 1]
  const lastIsSign = last !== undefined && isSign(last)
  if (isSign(token)) {
    if (!tokens.length) return [...tokens]
    if (lastIsSign) return [...tokens.slice(0, -1), token]
    const terms = (tokens.length + 1) / 2
    return terms < MAX_TERMS ? [...tokens, token] : [...tokens]
  }
  if (tokens.length && !lastIsSign) return [...tokens.slice(0, -1), token]
  return [...tokens, token]
}

function sameNumber(a: string, b: string): boolean {
  const x = parseDecimal(a)
  const y = parseDecimal(b)
  return x !== null && y !== null && equals(x, y)
}

function sameMultiset(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false
  const rest = [...b]
  return a.every((x) => {
    const i = rest.findIndex((y) => sameNumber(x, y))
    if (i < 0) return false
    rest.splice(i, 1)
    return true
  })
}

/** True if the built action is the expected one: + and · in any order, − with the same first number, : exactly. */
export function actionMatches(tokens: readonly string[], action: Action): boolean {
  const terms = tokens.filter((_, i) => i % 2 === 0)
  const signs = tokens.filter((_, i) => i % 2 === 1)
  if (signs.some((sign) => sign !== action.sign)) return false
  switch (action.sign) {
    case '+':
    case '·':
      return sameMultiset(terms, action.terms)
    case '−':
      return terms.length > 0 && sameNumber(terms[0], action.terms[0]) && sameMultiset(terms.slice(1), action.terms.slice(1))
    case ':':
      return terms.length === action.terms.length && terms.every((term, i) => sameNumber(term, action.terms[i]))
  }
}

/**
 * One action of Обчисли: the action she built from chips, then the result she
 * typed. A wrong action (a plan or decode mistake) gets the hint for the wrong
 * sign she used, or the action's hint when the sign is right or has no hint of
 * its own; a right action with a wrong result is an arithmetic slip.
 */
export function checkAction(tokens: readonly string[], result: string, action: Action): Verdict {
  const complete = tokens.length >= 3 && tokens.length % 2 === 1
  if (!complete) return { kind: 'empty', message: 'Склади дію: число, знак, число.' }
  if (!parseDecimal(result)) return { kind: 'empty', message: 'Введи результат.' }
  if (!actionMatches(tokens, action)) {
    const hint = action.hint ?? 'Подивись на короткий запис: що треба знайти цією дією?'
    const sign = tokens.filter((_, i) => i % 2 === 1).find((s): s is Sign => isSign(s) && s !== action.sign)
    return sign ? { kind: 'wrong', hint: action.signHints?.[sign] ?? hint, sign } : { kind: 'wrong', hint }
  }
  if (!answersMatch(result, action.result)) return { kind: 'wrong', hint: SLIP_HINT, slip: true }
  return { kind: 'right' }
}

/** What Обчисли says when it shows the action: the action, then its reason. */
export function shownAction(action: Action): string {
  const line = `${expression(action.terms, action.sign)} = ${action.result} (${action.unit}).`
  return action.reason ? `${line} ${action.reason}` : line
}

// ---------- the direction check ----------

/** Her pick in a direction check, «більше» or «менше». */
export function checkDirection(check: DirectionCheck, picked: Direction | null): Verdict {
  if (picked === null) return { kind: 'empty', message: 'Вибери: більше чи менше.' }
  return picked === check.answer ? { kind: 'right' } : { kind: 'wrong', hint: check.hint }
}

/** The direction check's answer as a sentence, kept in view while she builds the action: «За 20 хв він пройде менше, ніж 3000 м.» */
export function directionStatement(check: DirectionCheck): string {
  return check.question.replace('більше чи менше', check.answer).replace(/\?$/, '.')
}

/** The action as the school writes it, terms joined by its sign: `8,4 + 3,7`. */
export function expression(terms: readonly string[], sign: Sign): string {
  return terms.join(` ${sign} `)
}

/** The tokens of an action, as if she had built it from chips. */
export function actionTokens(action: Action): string[] {
  return action.terms.flatMap((term, i) => (i ? [action.sign, term] : [term]))
}
