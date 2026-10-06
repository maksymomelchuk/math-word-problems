/**
 * The loop through the problem set, as pure functions for the game layer to
 * call: which problem is next, whether a handover is due before it, each
 * level's repeat queue, and whether a level or the whole set is finished. Only
 * her own attempts count, not the parent's stage-switch plays. No UI code.
 */
import type { Progress } from '../lib/progress'
import { compareSlots, parseSlot } from '../problems/slots'
import { isMissed, ownAttempts, type OwnAttempt } from './learner'
import { handoverAt } from './stages'

function attemptsAt(progress: Progress, id: string): OwnAttempt[] {
  return ownAttempts(progress).filter((a) => a.problemId === id)
}

/** True once she has finished the problem at least once. */
export function isFinished(progress: Progress, id: string): boolean {
  return attemptsAt(progress, id).some((a) => a.finishedAt)
}

/**
 * Her first pass at a problem: its attempts up to and including the first one
 * she finished. Replays after that, and repeats, aren't part of it.
 */
function firstPass(attempts: readonly OwnAttempt[]): OwnAttempt[] {
  const own = attempts.filter((a) => !a.repeat)
  const done = own.findIndex((a) => a.finishedAt)
  return done < 0 ? own : own.slice(0, done + 1)
}

/**
 * A missed problem comes back once, at the end of its level (after 4.7 for
 * Level 4), until she has finished its repeat. Only a miss on the first pass
 * queues it: a miss in its repeat, or in a replay after the set, doesn't.
 */
export function isRepeatDue(progress: Progress, id: string): boolean {
  const attempts = attemptsAt(progress, id)
  const pass = firstPass(attempts)
  // Due once she has finished the problem: until then it is still her open problem.
  return pass.some((a) => a.finishedAt) && pass.some(isMissed) && !attempts.some((a) => a.repeat && a.finishedAt)
}

/** The slots of a level, in order. */
export function levelSlots(slots: readonly string[], level: number): string[] {
  return slots.filter((id) => parseSlot(id)?.level === level).sort(compareSlots)
}

/** The levels the slots cover, in order. */
export function levels(slots: readonly string[]): number[] {
  return [...new Set(slots.flatMap((id) => parseSlot(id)?.level ?? []))].sort((a, b) => a - b)
}

/** A level's missed problems still to repeat, in slot order. */
export function repeatQueue(progress: Progress, slots: readonly string[], level: number): string[] {
  return levelSlots(slots, level).filter((id) => isRepeatDue(progress, id))
}

/** The repeats she has finished in a level, in the order she finished them. */
export function repeatsDone(progress: Progress, slots: readonly string[], level: number): string[] {
  const inLevel = new Set(levelSlots(slots, level))
  const done = ownAttempts(progress)
    .filter((a) => a.repeat && a.finishedAt && inLevel.has(a.problemId))
    .sort((a, b) => a.finishedAt!.localeCompare(b.finishedAt!))
    .map((a) => a.problemId)
  return [...new Set(done)]
}

/** A level's repeats, the finished ones first, then those still due: its ↻ items, in the order she meets them. */
export function levelRepeats(progress: Progress, slots: readonly string[], level: number): { id: string; done: boolean }[] {
  return [...repeatsDone(progress, slots, level).map((id) => ({ id, done: true })), ...repeatQueue(progress, slots, level).map((id) => ({ id, done: false }))]
}

/** The problems she has finished at least once, in slot order. */
export function finishedProblems(progress: Progress, slots: readonly string[]): string[] {
  return [...slots].sort(compareSlots).filter((id) => isFinished(progress, id))
}

/** Every problem of the level finished, and its repeats too. */
export function levelFinished(progress: Progress, slots: readonly string[], level: number): boolean {
  return levelSlots(slots, level).every((id) => isFinished(progress, id)) && !repeatQueue(progress, slots, level).length
}

/** Every level finished, with its repeats. After this she can open any problem. */
export function setFinished(progress: Progress, slots: readonly string[]): boolean {
  return levels(slots).every((level) => levelFinished(progress, slots, level))
}

/**
 * The next problem in the loop: the first unfinished problem of the first
 * unfinished level, then that level's repeats, then the next level. Null once
 * the set is finished.
 */
export function nextProblem(progress: Progress, slots: readonly string[]): { id: string; repeat: boolean } | null {
  for (const level of levels(slots)) {
    const open = levelSlots(slots, level).find((id) => !isFinished(progress, id))
    if (open) return { id: open, repeat: false }
    const [due] = repeatQueue(progress, slots, level)
    if (due) return { id: due, repeat: true }
  }
  return null
}

/** The handover text to show before this problem: at a stage's first slot, the first time she opens it. */
export function handoverDue(progress: Progress, id: string): string | null {
  const text = handoverAt(id)
  return text && !attemptsAt(progress, id).length ? text : null
}
