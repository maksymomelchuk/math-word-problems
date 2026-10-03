/**
 * «Спробувати» under «Для батьків»: Тип і схема on its own, for one problem,
 * in the version picked there. It starts with the write-up as it stands when
 * she reaches the step, and keeps its own records, apart from her problems'
 * attempts, so a try never marks a problem as started or solved.
 */
import type { HelpEvent, ProgressStorage } from '../../lib/progress'
import type { GuidedProblem } from '../../problems/types'
import { emptyNotebook, type Notebook } from '../flow'

/** The notebook when she reaches Тип і схема: the whole short record, the question found, every number labelled. */
export function notebookAtTypeStep(problem: GuidedProblem): Notebook {
  return {
    ...emptyNotebook(),
    record: Object.fromEntries(problem.writeUp.shortRecord.map((line) => [line.id, line.text])),
    questionFound: true,
    labelled: problem.text.flatMap((part) => (part.number ? [part.number] : [])),
  }
}

export type TypeStepTry = {
  problemId: string
  variant: string
  startedAt: string
  /** When she finished the step's diagram. Missing if she left early. */
  finishedAt?: string
  events: HelpEvent[]
}

export const TRIES_KEY = 'word-problem-poc:type-step-tries'
const KEEP = 60

function browserStorage(): ProgressStorage | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

export function loadTries(storage = browserStorage()): TypeStepTry[] {
  try {
    const saved: unknown = JSON.parse(storage?.getItem(TRIES_KEY) ?? '[]')
    return Array.isArray(saved) ? (saved as TypeStepTry[]) : []
  } catch {
    return []
  }
}

function changeTries(change: (tries: TypeStepTry[]) => TypeStepTry[], storage = browserStorage()): void {
  try {
    storage?.setItem(TRIES_KEY, JSON.stringify(change(loadTries(storage)).slice(-KEEP)))
  } catch {
    // storage full or blocked: the try still plays, it just isn't kept
  }
}

function changeTry(startedAt: string, change: (t: TypeStepTry) => TypeStepTry, storage = browserStorage()): void {
  changeTries((tries) => tries.map((t) => (t.startedAt === startedAt ? change(t) : t)), storage)
}

export function startTry(problemId: string, variant: string, now = new Date(), storage = browserStorage()): string {
  const startedAt = now.toISOString()
  changeTries((tries) => [...tries, { problemId, variant, startedAt, events: [] }], storage)
  return startedAt
}

export function recordTryEvent(startedAt: string, event: HelpEvent, storage = browserStorage()): void {
  changeTry(startedAt, (t) => ({ ...t, events: [...t.events, event] }), storage)
}

export function finishTry(startedAt: string, now = new Date(), storage = browserStorage()): void {
  changeTry(startedAt, (t) => (t.finishedAt ? t : { ...t, finishedAt: now.toISOString() }), storage)
}

export function clearTries(storage = browserStorage()): void {
  try {
    storage?.removeItem(TRIES_KEY)
  } catch {
    // nothing to clear
  }
}
