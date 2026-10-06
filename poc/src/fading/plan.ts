/**
 * Her own plan from 3.1, derived from the write-up, so nothing is written per
 * problem: the valid lines at each point (from every plan and its `needs`, the
 * problem's `Order:` lines), the asked-quantity option, «Інше», and the action
 * count. Pure functions, no UI code.
 */
import { respectsNeeds, type Verdict } from '../guided/checks'
import type { Action, GuidedProblem, SolutionPlan } from '../problems/types'

/** The school's question after a wrong plan line or action count. */
export const PLAN_MISS_HINT = 'Що можна знайти з того, що вже відомо? Подивись на короткий запис.'

/** The id of «Інше» among the line options. */
export const OTHER_LINE = 'other'

export type LineOption = { id: string; text: string; right: boolean }

/** The plans her lines so far fit: each line is in the plan and comes after the actions it needs. */
export function fittingPlans(plans: readonly SolutionPlan[], lines: readonly string[]): number[] {
  return plans.flatMap((plan, p) => {
    const order = lines.map((id) => plan.actions.findIndex((action) => action.id === id))
    return order.every((i) => i >= 0) && respectsNeeds(plan.actions, order) ? [p] : []
  })
}

/** An action's words as a plan line, before she computes it: its own `line` where the explanation would give an answer away. */
export function planWords(action: Action): string {
  return action.line ?? action.explanation
}

/** What one action finds, as she reads it: the plan card's words when the problem has cards, else the action's plan-line words. */
export function lineText(problem: GuidedProblem, id: string): string {
  const card = problem.steps.plan?.cards.find((c) => c.id === id && !c.reason)
  if (card) return card.text
  const action = problem.writeUp.plans.flatMap((plan) => plan.actions).find((a) => a.id === id)
  return action ? planWords(action) : id
}

/** The quantities a valid plan can find next, after her lines so far. Every valid plan counts. */
export function validNextLines(plans: readonly SolutionPlan[], lines: readonly string[]): string[] {
  const next = new Set<string>()
  for (const p of fittingPlans(plans, lines)) {
    const { actions } = plans[p]
    const picked = lines.map((id) => actions.findIndex((action) => action.id === id))
    actions.forEach((action, index) => {
      if (lines.includes(action.id)) return
      if (respectsNeeds(actions, [...picked, index])) next.add(action.id)
    })
  }
  return [...next]
}

/** The quantity the problem asks: the main plan's last action. */
export function askedLine(plans: readonly SolutionPlan[]): string {
  const main = plans[0].actions
  return main[main.length - 1].id
}

/**
 * «Що знаходить твоя перша дія?»: every quantity a valid plan can find now,
 * the asked quantity if it can't be found yet (the common jump to the answer),
 * then «Інше». Sorted by their words, so the right one has no fixed place.
 */
export function lineOptions(problem: GuidedProblem, lines: readonly string[]): LineOption[] {
  const { plans } = problem.writeUp
  const valid = validNextLines(plans, lines)
  const asked = askedLine(plans)
  const ids = valid.includes(asked) || lines.includes(asked) ? valid : [...valid, asked]
  const options = ids.map((id) => ({ id, text: lineText(problem, id), right: valid.includes(id) }))
  options.sort((a, b) => a.text.localeCompare(b.text, 'uk'))
  return [...options, { id: OTHER_LINE, text: 'Інше', right: false }]
}

/** Her lines as a plan: the first valid plan they fit, and its action indexes in her order. Null if they fit none. */
export function planFromLines(plans: readonly SolutionPlan[], lines: readonly string[]): { plan: number; order: number[] } | null {
  const [p] = fittingPlans(plans, lines)
  if (p === undefined) return null
  return { plan: p, order: lines.map((id) => plans[p].actions.findIndex((action) => action.id === id)) }
}

/** True once her lines are a whole valid plan. */
export function planComplete(plans: readonly SolutionPlan[], lines: readonly string[]): boolean {
  return lines.length > 0 && fittingPlans(plans, lines).some((p) => plans[p].actions.length === lines.length)
}

/** The numbers of actions a valid plan can have: «Скільки дій у твоєму плані?» is right if it's one of them. */
export function actionCounts(plans: readonly SolutionPlan[]): number[] {
  return [...new Set(plans.map((plan) => plan.actions.length))].sort((a, b) => a - b)
}

export function checkActionCount(plans: readonly SolutionPlan[], typed: string): Verdict {
  if (!/^\d+$/.test(typed.trim())) return { kind: 'empty', message: 'Введи, скільки дій у твоєму плані.' }
  return actionCounts(plans).includes(Number(typed)) ? { kind: 'right' } : { kind: 'wrong', hint: PLAN_MISS_HINT }
}

/** «3 дії», «2 або 3 дії», as the shown action count says it. */
export function countWords(counts: readonly number[]): string {
  const last = counts[counts.length - 1]
  const noun = last % 10 >= 2 && last % 10 <= 4 && (last % 100 < 12 || last % 100 > 14) ? 'дії' : 'дій'
  return `${counts.join(' або ')} ${noun}`
}

const INSTRUMENTAL = ['першою', 'другою', 'третьою', 'четвертою', "п'ятою", 'шостою', 'сьомою', 'восьмою']
const NOMINATIVE = ['перша', 'друга', 'третя', 'четверта', "п'ята", 'шоста', 'сьома', 'восьма']

/** «першою» for the first line: «Про що дізнаєшся першою дією?» */
export function ordinalWith(line: number): string {
  return INSTRUMENTAL[line] ?? `${line + 1}-ю`
}

/** «перша» for the first line: «Що знаходить твоя перша дія?» */
export function ordinal(line: number): string {
  return NOMINATIVE[line] ?? `${line + 1}-а`
}

/**
 * What the problem asks, in its plan-line words, for «Що потрібно знати,
 * щоб знайти …?» and the answer's self-check: the words of each action that
 * finds a number in the answer, or of the main plan's last one.
 */
export function askedWords(problem: GuidedProblem): string {
  const actions = problem.writeUp.plans[0].actions
  const parts = problem.writeUp.answerParts.flatMap((part) => {
    if (part.kind !== 'number') return []
    const action = actions.find((a) => a.result === part.value)
    return action ? [planWords(action)] : []
  })
  return parts.length ? parts.join(' і ') : planWords(actions[actions.length - 1])
}
