/**
 * The problem set as she moves through it: each level's problems and repeats
 * with their state, the problem numbers she sees (1–30), and which level-end
 * or set-end screen is due. Built on the loop in `fading/loop.ts`. The same
 * for every option of the game layer; only how it's drawn differs. Pure, no
 * UI code.
 */
import { finishedProblems, isFinished, isRepeatDue, levelFinished, levelRepeats, levelSlots, levels, nextProblem, repeatsDone, setFinished } from '../fading/loop'
import { stageOfSlot } from '../fading/stages'
import { withAttempt, type Progress } from '../lib/progress'
import { compareSlots, parseSlot } from '../problems/slots'
import { attemptOutcome, type Outcome } from './outcome'

/** Done (it opens again as a replay), the next one in the loop, or not open yet. Only the next one opens until the set is finished; then every one does. */
export type ItemState = 'done' | 'next' | 'locked'

export type PathItem = {
  id: string
  /** The number she sees: 1–30 through the set. */
  number: number
  /** A ↻ repeat of a missed problem. */
  repeat: boolean
  state: ItemState
  /** From Level 2 a problem needs the notebook. */
  notebook: boolean
}

export type PathLevel = {
  level: number
  state: 'done' | 'current' | 'locked'
  items: PathItem[]
  problems: number
  problemsDone: number
  /** Repeats she has finished in this level. */
  repeatsDone: number
  /** From Level 2 the level is done with the notebook. */
  notebook: boolean
}

export type Path = {
  levels: PathLevel[]
  next: { id: string; repeat: boolean } | null
  /** Every level finished with its repeats: every problem opens. */
  finished: boolean
  done: number
  total: number
}

/** The number she sees for a slot: its place in the set, 1–30. */
export function problemNumber(slots: readonly string[], id: string): number {
  return [...slots].sort(compareSlots).indexOf(id) + 1
}

function needsNotebook(id: string): boolean {
  return stageOfSlot(id) !== '1'
}

export function pathOf(progress: Progress, slots: readonly string[]): Path {
  const next = nextProblem(progress, slots)
  const finished = next === null && setFinished(progress, slots)
  const itemState = (id: string, repeat: boolean, done: boolean): ItemState => {
    if (done || finished) return 'done'
    return next?.id === id && next.repeat === repeat ? 'next' : 'locked'
  }
  const pathLevels = levels(slots).map((level): PathLevel => {
    const ids = levelSlots(slots, level)
    const items: PathItem[] = [
      ...ids.map((id) => ({ id, number: problemNumber(slots, id), repeat: false, state: itemState(id, false, isFinished(progress, id)), notebook: needsNotebook(id) })),
      ...levelRepeats(progress, slots, level).map(({ id, done }) => ({ id, number: problemNumber(slots, id), repeat: true, state: itemState(id, true, done), notebook: needsNotebook(id) })),
    ]
    let state: PathLevel['state'] = 'locked'
    if (finished || levelFinished(progress, slots, level)) state = 'done'
    else if (next && parseSlot(next.id)?.level === level) state = 'current'
    return {
      level,
      state,
      items,
      problems: ids.length,
      problemsDone: ids.filter((id) => isFinished(progress, id)).length,
      repeatsDone: repeatsDone(progress, slots, level).length,
      notebook: needsNotebook(ids[0]),
    }
  })
  return { levels: pathLevels, next, finished, done: finishedProblems(progress, slots).length, total: slots.length }
}

export type Celebration = { kind: 'level'; level: number } | { kind: 'set' }

/**
 * The level-end screen due: the first finished level whose screen she hasn't
 * seen. After the last level's repeats, the set-end screen takes its place.
 */
export function celebrationDue(progress: Progress, slots: readonly string[]): Celebration | null {
  const all = levels(slots)
  const seen = progress.game?.levelEnds ?? []
  for (const level of all.slice(0, -1)) {
    if (levelFinished(progress, slots, level) && !seen.includes(level)) return { kind: 'level', level }
  }
  return setFinished(progress, slots) && !progress.game?.setEnd ? { kind: 'set' } : null
}

/** What a level held, for its level-end screen. */
export function levelSummary(progress: Progress, slots: readonly string[], level: number): { problems: number; repeats: number } {
  return { problems: levelSlots(slots, level).length, repeats: repeatsDone(progress, slots, level).length }
}

export type EndOfProblem = {
  outcome: Outcome
  /** The problem comes back at the end of this level: a first-pass miss. */
  repeatAtLevel: number | null
  /** Problems finished at least once, this one included. */
  done: number
  total: number
}

/**
 * What the end-of-problem screen says about her latest attempt at a problem.
 * The screen opens just before the attempt is marked finished, so it is
 * counted as finished here.
 */
export function endOfProblem(progress: Progress, slots: readonly string[], id: string, now = new Date()): EndOfProblem | null {
  const attempt = progress.problems[id]?.attempts.at(-1)
  if (!attempt) return null
  const after = withAttempt(progress, id, attempt.startedAt, (a) => (a.finishedAt ? a : { ...a, finishedAt: now.toISOString() }))
  const outcome = attemptOutcome(attempt)
  const missedFirstTime = outcome.kind === 'shown' && !attempt.switched && isRepeatDue(after, id)
  return {
    outcome,
    repeatAtLevel: missedFirstTime ? (parseSlot(id)?.level ?? null) : null,
    done: finishedProblems(after, slots).length,
    total: slots.length,
  }
}
