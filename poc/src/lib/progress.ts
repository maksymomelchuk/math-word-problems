/**
 * The learner's progress, saved in localStorage on this device only.
 *
 * Each problem keeps a list of attempts. An attempt records, against each
 * step of the routine, every hint she got, every answer that was shown, and
 * every arithmetic slip, each with its time, so later tickets can count
 * streaks or daily limits and fading can read how a step went. Saved data from
 * an older version is dropped on load, so a PoC device starts over cleanly.
 */
import type { Sign, StepId } from '../problems/types'

export const PROGRESS_VERSION = 2

/** One wrong try on a screen of the routine. */
export type HelpEvent = {
  /** When it happened, as an ISO 8601 time. */
  at: string
  step: StepId
  /**
   * Which part of the step: `why` for «Чому?», `question` for tapping the
   * question and `unknown` for what exactly is unknown in Знайти, a number
   * id or `hidden-N` in Відомо, a comparison id (`-flip` for saying it from
   * the unknown's side) in Порівняння, `types` (all relations at once),
   * `type-N` (relation N alone; `-family` for «Що тут є?») or `diagram` in Тип і схема,
   * an action id in Обчисли (`-direction` for the «більше чи менше» check
   * before it). Left out when the step has one part.
   */
  part?: string
  /** What she got: a hint (first wrong try) or the answer shown (second). */
  help: 'hint' | 'shown'
  /** The action was right but its result wasn't: an arithmetic slip, kept apart from other mistakes. */
  slip?: true
  /** In Обчисли, the wrong sign she built the action with. */
  sign?: Sign
  /** In Тип і схема, the version of the step she saw (see `guided/typeStep/variants.ts`). */
  variant?: string
}

export type Attempt = {
  /** When she opened the problem. Also identifies the attempt. */
  startedAt: string
  /** When she reached the closing Розбір. Missing while unfinished. */
  finishedAt?: string
  /** The routine steps the problem prompted this time. */
  prompted: StepId[]
  /** The index of the valid plan she followed, once she has one. */
  plan?: number
  /** The version of a step she saw, for steps the parent can switch: `{ typeDiagram: 'pictures' }`. Set when she reaches the step. */
  variants?: Partial<Record<StepId, string>>
  events: HelpEvent[]
}

export type ProblemRecord = {
  attempts: Attempt[]
}

export type Progress = {
  version: typeof PROGRESS_VERSION
  /** Records keyed by problem id (the problem-set slot, such as `2.3`). */
  problems: Record<string, ProblemRecord>
}

export const STORAGE_KEY = 'word-problem-poc:progress'

/** The subset of the Web Storage API used here, so tests can pass a fake. */
export type ProgressStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export function emptyProgress(): Progress {
  return { version: PROGRESS_VERSION, problems: {} }
}

function browserStorage(): ProgressStorage | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null // access can throw when storage is blocked
  }
}

/** The saved progress, or empty progress if nothing valid is saved. */
export function loadProgress(storage = browserStorage()): Progress {
  try {
    const raw = storage?.getItem(STORAGE_KEY)
    if (!raw) return emptyProgress()
    const saved: unknown = JSON.parse(raw)
    if (isProgress(saved)) return saved
  } catch {
    // unreadable or corrupt: fall through to a clean start
  }
  return emptyProgress()
}

/** Saves progress. Returns false if the device refused (storage full or blocked). */
export function saveProgress(progress: Progress, storage = browserStorage()): boolean {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(progress))
    return storage !== null
  } catch {
    return false
  }
}

export function resetProgress(storage = browserStorage()): void {
  try {
    storage?.removeItem(STORAGE_KEY)
  } catch {
    // nothing saved that we can reach
  }
}

function isProgress(value: unknown): value is Progress {
  if (typeof value !== 'object' || value === null) return false
  const { version, problems } = value as Partial<Progress>
  return version === PROGRESS_VERSION && typeof problems === 'object' && problems !== null && !Array.isArray(problems)
}

// ---------- recording ----------

/** Progress with a new, unfinished attempt at a problem. */
export function withAttemptStarted(progress: Progress, problemId: string, startedAt: string, prompted: StepId[]): Progress {
  const record = progress.problems[problemId] ?? { attempts: [] }
  return {
    ...progress,
    problems: { ...progress.problems, [problemId]: { attempts: [...record.attempts, { startedAt, prompted, events: [] }] } },
  }
}

/** Progress with one attempt changed. Unknown attempts are left alone. */
export function withAttempt(progress: Progress, problemId: string, startedAt: string, change: (attempt: Attempt) => Attempt): Progress {
  const record = progress.problems[problemId]
  if (!record?.attempts.some((attempt) => attempt.startedAt === startedAt)) return progress
  const attempts = record.attempts.map((attempt) => (attempt.startedAt === startedAt ? change(attempt) : attempt))
  return { ...progress, problems: { ...progress.problems, [problemId]: { attempts } } }
}

/** Loads, changes and saves the progress in one go. */
export function updateProgress(change: (progress: Progress) => Progress, storage = browserStorage()): boolean {
  return saveProgress(change(loadProgress(storage)), storage)
}

export function startAttempt(problemId: string, prompted: StepId[], now = new Date(), storage = browserStorage()): string {
  const startedAt = now.toISOString()
  updateProgress((progress) => withAttemptStarted(progress, problemId, startedAt, prompted), storage)
  return startedAt
}

export function recordHelp(problemId: string, startedAt: string, event: HelpEvent, storage = browserStorage()): void {
  updateProgress((progress) => withAttempt(progress, problemId, startedAt, (attempt) => ({ ...attempt, events: [...attempt.events, event] })), storage)
}

export function recordPlan(problemId: string, startedAt: string, plan: number, storage = browserStorage()): void {
  updateProgress((progress) => withAttempt(progress, problemId, startedAt, (attempt) => ({ ...attempt, plan })), storage)
}

/** Notes which version of a step she saw in this attempt. */
export function recordVariant(problemId: string, startedAt: string, step: StepId, variant: string, storage = browserStorage()): void {
  updateProgress(
    (progress) => withAttempt(progress, problemId, startedAt, (attempt) => ({ ...attempt, variants: { ...attempt.variants, [step]: variant } })),
    storage,
  )
}

export function finishAttempt(problemId: string, startedAt: string, now = new Date(), storage = browserStorage()): void {
  updateProgress(
    (progress) => withAttempt(progress, problemId, startedAt, (attempt) => (attempt.finishedAt ? attempt : { ...attempt, finishedAt: now.toISOString() })),
    storage,
  )
}

/** True if any attempt at the problem reached the Розбір. */
export function isSolved(progress: Progress, problemId: string): boolean {
  return progress.problems[problemId]?.attempts.some((attempt) => attempt.finishedAt) ?? false
}
