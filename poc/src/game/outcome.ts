/**
 * How a finished attempt went, for the end-of-problem screen: a solo success,
 * every step right first time, with hints or wrong tries, or something the app
 * had to show. "Shown" has one meaning everywhere: what makes a problem missed
 * (`isMissed` in `fading/learner.ts`), a plan line or an action. A shown
 * direction check, a «Ні» self-check and a wrong solo answer are recorded,
 * never counted as shown. Pure, no UI code.
 */
import { isMissed } from '../fading/learner'
import type { Attempt } from '../lib/progress'

/** What the app had to show: the whole plan (plan cards, or a big-step plan's model), plan lines, actions. */
export type Shown = { wholePlan: boolean; planLines: number; actions: number }

export type Outcome = { kind: 'solo' } | { kind: 'clean' } | { kind: 'hints' } | { kind: 'shown'; shown: Shown }

/** What a missed attempt had shown, each plan line and action counted once. */
export function shownIn(attempt: Attempt): Shown {
  let wholePlan = false
  const lines = new Set<string>()
  const actions = new Set<string>()
  for (const e of attempt.events) {
    if (e.help !== 'shown') continue
    if (e.step === 'plan' && e.part !== 'why') wholePlan = true
    if (e.step === 'compute' && !e.part?.endsWith('-direction')) actions.add(e.part ?? 'action')
  }
  for (const e of attempt.log ?? []) {
    if (e.kind === 'planLine' && e.shown) lines.add(`line-${e.line + 1}`)
    else if (e.kind === 'result' && e.shown) actions.add(e.action)
    else if (e.kind === 'hint' && e.tap === 2 && e.step === 'plan') {
      if (e.part === 'whole') wholePlan = true
      else lines.add(e.part ?? 'line')
    } else if (e.kind === 'hint' && e.tap === 2 && e.step === 'compute') actions.add(e.part ?? 'action')
  }
  return { wholePlan, planLines: lines.size, actions: actions.size }
}

/** True if every try was right first time: no hint, no wrong pick or result, no «Підказка», no «Ні». */
function allRightFirstTime(attempt: Attempt): boolean {
  if (attempt.events.length) return false
  return (attempt.log ?? []).every((e) => {
    if (e.kind === 'hint' || e.kind === 'sameAction') return false
    if (e.kind === 'selfCheck') return e.yes
    return !('right' in e) || e.right
  })
}

export function attemptOutcome(attempt: Attempt): Outcome {
  const log = attempt.log ?? []
  const solo = log.some((e) => e.kind === 'soloAnswer' && e.right) && !log.some((e) => e.kind === 'soloSwitch')
  if (solo) return { kind: 'solo' }
  if (isMissed(attempt)) return { kind: 'shown', shown: shownIn(attempt) }
  return allRightFirstTime(attempt) ? { kind: 'clean' } : { kind: 'hints' }
}

const NUMBER_WORDS: Record<number, { m: string; f: string }> = { 2: { m: 'два', f: 'дві' }, 3: { m: 'три', f: 'три' }, 4: { m: 'чотири', f: 'чотири' } }

/** «рядок плану», «два рядки плану», «5 рядків плану». */
function planLinesWords(n: number): string {
  if (n === 1) return 'рядок плану'
  return n <= 4 ? `${NUMBER_WORDS[n].m} рядки плану` : `${n} рядків плану`
}

/** «дію», «дві дії», «5 дій». */
function actionsWords(n: number): string {
  if (n === 1) return 'дію'
  return n <= 4 ? `${NUMBER_WORDS[n].f} дії` : `${n} дій`
}

/** One line naming what had to be shown: «Довелося показати рядок плану і дію.» Hints are never listed. */
export function shownLine(shown: Shown): string {
  const parts = [...(shown.wholePlan ? ['план'] : shown.planLines ? [planLinesWords(shown.planLines)] : []), ...(shown.actions ? [actionsWords(shown.actions)] : [])]
  return parts.length ? `Довелося показати ${parts.join(' і ')}.` : 'Довелося показати відповідь.'
}

/** «7 задач», «1 повтор»: Ukrainian plural forms for one, a few, many. */
export function countWords(n: number, forms: readonly [one: string, few: string, many: string]): string {
  const tens = n % 100
  const units = n % 10
  const form = tens >= 11 && tens <= 14 ? forms[2] : units === 1 ? forms[0] : units >= 2 && units <= 4 ? forms[1] : forms[2]
  return `${n} ${form}`
}
