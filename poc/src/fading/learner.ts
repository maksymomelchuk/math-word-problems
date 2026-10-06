/**
 * Where she stands in the fading, read from her progress records: her plan's
 * step size, the direction check's fade per relation type, her furthest
 * problem, and which attempts count as missed. Derived, never stored, so
 * «Стерти записи» resets it, and the parent's stage-switch plays leave it
 * alone. Pure functions, no UI code.
 */
import type { Attempt, Progress } from '../lib/progress'
import { compareSlots } from '../problems/slots'
import type { ProblemTypeId } from '../problems/types'
import type { StepSize } from './stages'

export type DirectionFade = {
  /** Right answers in a row, each followed by a right result. */
  streak: number
  /** Two in a row: the check stops for this type until a wrong sign there. */
  faded: boolean
}

export type LearnerState = {
  stepSize: StepSize
  /** Problems in a row with every plan line right first time, since her last move. */
  planStreak: number
  /** She moved between small and big steps after her last plan and hasn't seen its line yet. */
  justMoved: StepSize | null
  direction: Partial<Record<ProblemTypeId, DirectionFade>>
  /** The furthest slot she has opened. Replays behind it run at its stage. */
  furthest: string | null
}

export type OwnAttempt = Attempt & { problemId: string }

/**
 * Her attempts, oldest first. Left out: those played from the parent's stage
 * switch, and those from before fading (no `stage`), which were the parent's
 * and her first looks at the fully guided 2.3 and 4.7.
 */
export function ownAttempts(progress: Progress): OwnAttempt[] {
  return Object.entries(progress.problems)
    .flatMap(([problemId, record]) => record.attempts.filter((a) => !a.switched && a.stage !== undefined).map((a) => ({ ...a, problemId })))
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
}

/**
 * Missed: the app had to show a plan line or an action's result. That covers a
 * plan card or an action shown while prompted, a typed result shown, and a plan
 * line or an action shown by a second «Підказка» tap. A wrong direction-check
 * answer or a «Ні» self-check doesn't count.
 */
export function isMissed(attempt: Attempt): boolean {
  const guided = attempt.events.some(
    (e) => e.help === 'shown' && ((e.step === 'plan' && e.part !== 'why') || (e.step === 'compute' && !e.part?.endsWith('-direction'))),
  )
  const paper = (attempt.log ?? []).some(
    (e) => ((e.kind === 'planLine' || e.kind === 'result') && e.shown) || (e.kind === 'hint' && e.tap === 2 && (e.step === 'plan' || e.step === 'compute')),
  )
  return guided || paper
}

/** How her own plan went: every line right first time (and the problem finished), a line not right first time, or no plan of her own. */
export function planOutcome(attempt: Attempt): 'right' | 'wrong' | null {
  const log = attempt.log ?? []
  const planned = log.some((e) => e.kind === 'planLine' || e.kind === 'actionCount')
  if (!planned) return null
  const wrong = log.some((e) => ((e.kind === 'planLine' || e.kind === 'actionCount') && !e.right) || (e.kind === 'hint' && e.tap === 2 && e.step === 'plan'))
  if (wrong) return 'wrong'
  return attempt.finishedAt ? 'right' : null
}

type ActionTrace = { type?: ProblemTypeId; directionRight?: boolean; resultRight?: boolean; wrongSign: boolean }

/** Each action of an attempt's paper Обчисли, in order: its direction check's first answer, its first result, and any wrong sign. */
function actionTraces(attempt: Attempt): ActionTrace[] {
  const traces = new Map<number, ActionTrace>()
  const at = (line: number) => {
    let trace = traces.get(line)
    if (!trace) {
      trace = { wrongSign: false }
      traces.set(line, trace)
    }
    return trace
  }
  for (const e of attempt.log ?? []) {
    if (e.kind === 'direction' && !e.viaHint) {
      const trace = at(e.line)
      trace.type = e.relationType
      trace.directionRight ??= e.right
    } else if (e.kind === 'result') {
      const trace = at(e.line)
      trace.type ??= e.relationType
      trace.resultRight ??= e.right
      if (e.sign) trace.wrongSign = true
    }
  }
  return [...traces.values()]
}

/**
 * The direction check's fade, one type at a time: it stops after two right
 * answers in a row, each counted only if the action's result is right first
 * time too, and comes back after a wrong sign on that type.
 */
export function stepDirection(direction: LearnerState['direction'], attempt: Attempt): LearnerState['direction'] {
  const next = { ...direction }
  for (const trace of actionTraces(attempt)) {
    if (!trace.type) continue
    const fade = { ...(next[trace.type] ?? { streak: 0, faded: false }) }
    if (trace.directionRight !== undefined) {
      if (trace.directionRight && trace.resultRight) {
        fade.streak += 1
        if (fade.streak >= 2) fade.faded = true
      } else fade.streak = 0
    }
    if (trace.wrongSign) {
      fade.faded = false
      fade.streak = 0
    }
    next[trace.type] = fade
  }
  return next
}

export const START: LearnerState = { stepSize: 'small', planStreak: 0, justMoved: null, direction: {}, furthest: null }

/** Her state after her own attempts, oldest first. */
export function learnerState(progress: Progress): LearnerState {
  let state = START
  for (const attempt of ownAttempts(progress)) {
    let { stepSize, planStreak, justMoved } = state
    if ((attempt.log ?? []).some((e) => e.kind === 'stepSize')) justMoved = null
    const outcome = planOutcome(attempt)
    if (outcome === 'right') {
      planStreak += 1
      if (stepSize === 'small' && planStreak >= 2) {
        stepSize = 'big'
        planStreak = 0
        justMoved = 'big'
      }
    } else if (outcome === 'wrong') {
      planStreak = 0
      if (stepSize === 'big') {
        stepSize = 'small'
        justMoved = 'small'
      }
    }
    const furthest = state.furthest === null || compareSlots(attempt.problemId, state.furthest) > 0 ? attempt.problemId : state.furthest
    state = { stepSize, planStreak, justMoved, direction: stepDirection(state.direction, attempt), furthest }
  }
  return state
}

/** True while the direction check is asked for this type. */
export function directionActive(state: LearnerState, type: ProblemTypeId): boolean {
  return !state.direction[type]?.faded
}

/** The types whose check stopped or came back between two states, for her records. */
export function fadeChanges(before: LearnerState, after: LearnerState): { relationType: ProblemTypeId; faded: boolean }[] {
  return (Object.keys(after.direction) as ProblemTypeId[]).flatMap((type) => {
    const was = before.direction[type]?.faded ?? false
    const now = after.direction[type]?.faded ?? false
    return was === now ? [] : [{ relationType: type, faded: now }]
  })
}
